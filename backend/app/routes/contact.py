from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from typing import List, Optional
from app.schemas.contact import ContactCreate, ContactResponse
from app.utils.auth import get_current_admin_user
from app.utils.email import send_contact_notification
from app.database import get_collection
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/contact", tags=["Contact"])

# =====================================================
# CREATE CONTACT (PUBLIC)
# =====================================================
@router.post("", response_model=ContactResponse, status_code=201)
async def create_contact(contact_in: ContactCreate, background_tasks: BackgroundTasks):
    contacts_collection = get_collection("contacts")
    
    # 1. Convert Pydantic model to dict
    contact_dict = contact_in.model_dump() 
    now = datetime.utcnow()
    contact_dict["status"] = "unread"
    contact_dict["created_at"] = now
    contact_dict["updated_at"] = now
    
    # 2. Insert into MongoDB
    result = await contacts_collection.insert_one(contact_dict)
    
    # 3. Fetch the created document
    created_contact = await contacts_collection.find_one({"_id": result.inserted_id})
    
    if not created_contact:
        raise HTTPException(status_code=500, detail="Failed to create contact")
    
    # 4. Handle Email Notification
    try:
        background_tasks.add_task(
            send_contact_notification,
            name=contact_in.name,
            email=contact_in.email,
            subject=contact_in.subject,
            message=contact_in.message,
        )
    except Exception as e:
        print(f"Error sending email: {e}")
    
    # ✅ FIX: Use unpacking. The schema maps '_id' to 'id' automatically.
    return ContactResponse(**created_contact)

# =====================================================
# GET ALL CONTACTS (ADMIN ONLY)
# =====================================================
@router.get("", response_model=List[ContactResponse])
async def get_all_contacts(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_admin_user),
):
    contacts_collection = get_collection("contacts")
    query = {"status": status_filter} if status_filter else {}

    cursor = contacts_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    contacts = await cursor.to_list(length=limit)

    # ✅ FIX: Simplified list comprehension
    return [ContactResponse(**c) for c in contacts]

# =====================================================
# GET SINGLE CONTACT (ADMIN ONLY)
# =====================================================
@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: str,
    current_user: dict = Depends(get_current_admin_user),
):
    contacts_collection = get_collection("contacts")

    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    contact = await contacts_collection.find_one({"_id": ObjectId(contact_id)})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Update status to read if unread
    if contact.get("status") == "unread":
        now = datetime.utcnow()
        await contacts_collection.update_one(
            {"_id": ObjectId(contact_id)},
            {"$set": {"status": "read", "updated_at": now}}
        )
        contact["status"] = "read"
        contact["updated_at"] = now

    # ✅ FIX: Unpack the dictionary
    return ContactResponse(**contact)

# =====================================================
# DELETE CONTACT (ADMIN ONLY)
# =====================================================
@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: str,
    current_user: dict = Depends(get_current_admin_user),
):
    contacts_collection = get_collection("contacts")
    
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    result = await contacts_collection.delete_one({"_id": ObjectId(contact_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")

    return None
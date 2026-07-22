from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from app.database import get_collection
from app.utils.auth import get_current_admin_user

router = APIRouter(prefix="/contact", tags=["Contact"])

class ContactForm(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# ✅ POST is PUBLIC - anyone can send a message
@router.post("/")
async def send_contact(form: ContactForm):
    """Send contact message - PUBLIC endpoint"""
    try:
        print(f"📥 Received contact from: {form.name} ({form.email})")
        
        contacts_collection = get_collection("contacts")
        
        if contacts_collection is not None:
            # Save to database
            contact_dict = {
                "name": form.name,
                "email": form.email,
                "subject": form.subject,
                "message": form.message,
                "status": "unread",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await contacts_collection.insert_one(contact_dict)
            
            return {
                "success": True,
                "message": "Message received and saved!",
                "id": str(result.inserted_id)
            }
        else:
            return {
                "success": True,
                "message": "Message received!",
                "data": form.dict()
            }
            
    except Exception as e:
        print(f"❌ Error saving contact: {e}")
        return {
            "success": True,
            "message": "Message received!",
            "data": form.dict()
        }

# ✅ GET is ADMIN ONLY - requires authentication
@router.get("/")
async def get_contact_info(current_user: dict = Depends(get_current_admin_user)):
    """Get contact information - ADMIN ONLY"""
    return {
        "email": "rabif1820@gmail.com",
        "phone": "+923110853195"
    }

# ✅ GET all contacts - ADMIN ONLY
@router.get("/all")
async def get_all_contacts(current_user: dict = Depends(get_current_admin_user)):
    """Get all contacts - ADMIN ONLY"""
    contacts_collection = get_collection("contacts")
    if contacts_collection is None:
        return []
    
    contacts = await contacts_collection.find({}).sort("created_at", -1).to_list(length=100)
    
    return [
        {
            "id": str(c["_id"]),
            "name": c["name"],
            "email": c["email"],
            "subject": c["subject"],
            "message": c["message"],
            "status": c.get("status", "unread"),
            "created_at": c.get("created_at")
        }
        for c in contacts
    ]
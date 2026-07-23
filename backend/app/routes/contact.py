from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from app.database import get_collection
from app.utils.auth import get_current_admin_user
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter(prefix="/contact", tags=["Contact"])

class ContactForm(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# ✅ Email configuration from .env
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "Rabif1820@gmail.com")

def send_email_notification(name: str, email: str, subject: str, message: str):
    """Send email notification using SMTP"""
    try:
        if not SMTP_PASSWORD:
            print("⚠️ SMTP_PASSWORD not set. Email not sent.")
            return False

        # Create email
        msg = MIMEMultipart()
        msg['From'] = SMTP_FROM
        msg['To'] = ADMIN_EMAIL
        msg['Subject'] = f"📧 New Contact from {name}: {subject}"
        msg['Reply-To'] = email

        # Email body
        body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #0070f3; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ padding: 20px; background: #f9f9f9; border-radius: 0 0 10px 10px; }}
                .field {{ margin: 15px 0; padding: 10px; background: white; border-radius: 8px; }}
                .label {{ font-weight: bold; color: #333; }}
                .value {{ margin-top: 5px; }}
                .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>📨 New Contact Form Submission</h2>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="label">👤 Name:</div>
                        <div class="value"><strong>{name}</strong></div>
                    </div>
                    <div class="field">
                        <div class="label">📧 Email:</div>
                        <div class="value"><a href="mailto:{email}">{email}</a></div>
                    </div>
                    <div class="field">
                        <div class="label">📝 Subject:</div>
                        <div class="value"><strong>{subject}</strong></div>
                    </div>
                    <div class="field">
                        <div class="label">💬 Message:</div>
                        <div class="value" style="padding: 10px; background: #f0f0f0; border-radius: 5px;">{message}</div>
                    </div>
                </div>
                <div class="footer">
                    <p>This message was sent from your portfolio website</p>
                    <p style="font-size: 10px; color: #999;">Sent: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(body, 'html'))

        # Send email
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()

        print(f"✅ Email sent to {ADMIN_EMAIL}")
        return True

    except Exception as e:
        print(f"❌ Email error: {e}")
        return False


# ✅ POST is PUBLIC - anyone can send a message
@router.post("/")
async def send_contact(form: ContactForm):
    try:
        contacts = get_collection("contacts")

        contact = {
            "name": form.name,
            "email": form.email,
            "subject": form.subject,
            "message": form.message,
            "status": "unread",
            "created_at": datetime.utcnow()
        }

        result = await contacts.insert_one(contact)
        print(f"✅ Saved to MongoDB: {result.inserted_id}")

        # ✅ Send email notification
        email_sent = send_email_notification(
            form.name,
            form.email,
            form.subject,
            form.message
        )

        return {
            "success": True,
            "message": "Message sent successfully!" + (" Email notification sent." if email_sent else ""),
            "id": str(result.inserted_id),
            "email_sent": email_sent
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save contact: {str(e)}"
        )


# ✅ GET is ADMIN ONLY - requires authentication
@router.get("/")
async def get_contact_info(current_user: dict = Depends(get_current_admin_user)):
    """Get contact information - ADMIN ONLY"""
    return {
        "email": "Rabif1820@gmail.com",
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
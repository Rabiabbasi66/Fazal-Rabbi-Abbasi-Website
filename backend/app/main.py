from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from datetime import datetime

# =====================================================
# DATABASE FUNCTIONS (Simple version)
# =====================================================
client = None
db = None

async def connect_to_mongo():
    global client, db
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        import os
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        database_name = os.getenv("DATABASE_NAME", "portfolio_db")
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]
        print("✅ MongoDB Connected")
        return db
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        return None

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("✅ MongoDB Disconnected")

def get_collection(collection_name):
    global db
    if db is None:
        return None
    return db[collection_name]

# =====================================================
# PYDANTIC MODELS
# =====================================================
class ContactForm(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# =====================================================
# LIFESPAN
# =====================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up...")
    await connect_to_mongo()
    yield
    await close_mongo_connection()
    print("👋 Shutting down...")

# =====================================================
# FASTAPI APP
# =====================================================
app = FastAPI(
    title="Portfolio API",
    version="1.0.0",
    lifespan=lifespan
)

# =====================================================
# CORS
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fazal-rabbi-abbasi-website.vercel.app",
        "https://fazal-rabbi-abbasi-website-dcbx.vercel.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# ROUTES
# =====================================================
@app.get("/")
async def root():
    return {"message": "Welcome to Portfolio API", "version": "1.0.0"}

@app.get("/api")
async def api_root():
    return {
        "status": "ok",
        "message": "API is working",
        "endpoints": {
            "projects": "/projects",
            "skills": "/skills",
            "contact": "/contact"
        }
    }

@app.get("/projects")
async def get_projects():
    """Get all projects from MongoDB"""
    try:
        collection = get_collection("projects")
        if collection is None:
            return [
                {"id": "1", "title": "Project 1", "description": "Sample project"},
                {"id": "2", "title": "Project 2", "description": "Another sample"}
            ]
        
        projects = await collection.find({}).to_list(length=100)
        result = []
        for p in projects:
            result.append({
                "id": str(p["_id"]),
                "title": p.get("title", "Untitled"),
                "description": p.get("description", ""),
                "image": p.get("image", ""),
                "tags": p.get("tags", []),
                "github_url": p.get("github_url"),
                "demo_url": p.get("demo_url"),
                "featured": p.get("featured", False)
            })
        return result
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return []

@app.get("/skills")
async def get_skills():
    """Get all skills"""
    try:
        collection = get_collection("skills")
        if collection is None:
            return [
                {"name": "Python", "level": 90},
                {"name": "JavaScript", "level": 85},
                {"name": "React", "level": 80}
            ]
        
        skills = await collection.find({}).to_list(length=100)
        result = []
        for s in skills:
            result.append({
                "id": str(s["_id"]),
                "name": s.get("name", ""),
                "level": s.get("level", 50)
            })
        return result
    except Exception as e:
        print(f"Error fetching skills: {e}")
        return []

@app.get("/contact")
async def get_contact():
    return {
        "email": "rabif1820@gmail.com",
        "phone": "+923110853195"
    }

@app.post("/contact")
async def send_contact(form: ContactForm):
    """Send contact message - accepts JSON"""
    try:
        collection = get_collection("contacts")
        if collection is not None:
            await collection.insert_one({
                "name": form.name,
                "email": form.email,
                "subject": form.subject,
                "message": form.message,
                "status": "unread",
                "created_at": datetime.utcnow()
            })
            print(f"✅ Contact saved: {form.name} ({form.email})")
        else:
            print(f"⚠️ Database not connected, but message received from {form.name}")
        
        return {"success": True, "message": "Message received successfully!"}
    except Exception as e:
        print(f"❌ Error saving contact: {e}")
        return {"success": True, "message": "Message received (but not saved)"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}

# =====================================================
# RUN LOCALLY (for development)
# =====================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Global client variable
client: Optional[AsyncIOMotorClient] = None
db = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, db
    try:
        if client is None:
            client = AsyncIOMotorClient(settings.MONGODB_URL)
            db = client[settings.DATABASE_NAME]
            print("✅ MongoDB Connected")
            return db
        return db
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        return None

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client is not None:
        client.close()
        client = None
        print("✅ MongoDB Disconnected")

def get_database():
    """Get database instance"""
    return db

# ✅ THIS IS WHAT'S MISSING - ADD THIS FUNCTION
def get_collection(collection_name: str):
    """Get a MongoDB collection"""
    if db is None:
        return None
    return db[collection_name]
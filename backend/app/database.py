from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


class Database:
    client: Optional[AsyncIOMotorClient] = None


db = Database()


async def connect_to_mongo():
    if db.client is None:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        print("✅ MongoDB Connected")


async def close_mongo_connection():
    if db.client is not None:
        db.client.close()
        db.client = None
        print("❌ MongoDB Closed")


def get_database():
    if db.client is None:
        raise RuntimeError("MongoDB is not connected.")
    return db.client[settings.DATABASE_NAME]


def get_collection(name: str):
    return get_database()[name]
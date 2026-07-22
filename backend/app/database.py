from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = None
db = None


async def connect_to_mongo():
    global client, db

    if client is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)

        # test connection
        await client.admin.command("ping")

        db = client[settings.DATABASE_NAME]

        print("✅ MongoDB Connected Successfully")

    return db


async def close_mongo_connection():
    global client, db

    if client:
        client.close()

    client = None
    db = None

    print("🔌 MongoDB Closed")


def get_database():
    return db


def get_collection(name: str):
    if db is None:
        raise Exception("MongoDB is not connected!")

    return db[name]
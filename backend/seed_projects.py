from dotenv import load_dotenv
import os
from pymongo import MongoClient
from datetime import datetime

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGODB_URL)

db = client[DATABASE_NAME]
collection = db["projects"]

now = datetime.utcnow()

projects = [
    {
        "title": "AgriScan 3D",
        "description": "AI-powered drone crop mapping and disease detection using WebGPU, FastAPI, MongoDB and Computer Vision.",
        "image": "http://127.0.0.1:8000/images/agriscan.jpg",
        "tags": ["Python", "FastAPI", "AI", "Computer Vision", "MongoDB"],
        "github_url": "https://github.com/Rabiabbasi66/AgriScan3D",
        "demo_url":  None,
        "featured": True,
        "order": 1
    },
    {
        "title": "Abbasi Brand Cloth",
        "description": "Modern clothing brand website with responsive UI, product showcase and FastAPI backend.",
        "image": "http://127.0.0.1:8000/images/abbasi-brand.jpg",
        "tags": ["HTML", "CSS", "JavaScript", "FastAPI", "MongoDB"],
        "github_url": "https://github.com/Rabiabbasi66/cloths-brand-frontend",
       "demo_url":  None,
        "featured": True,
        "order": 2
    },
    {
        "title": "3D Portfolio Website",
        "description": "Interactive portfolio built using Three.js with animations, responsive UI and backend integration.",
        "image": "http://127.0.0.1:8000/images/portfolio.jpg",
        "tags": ["HTML", "CSS", "JavaScript", "Three.js", "FastAPI"],
        "github_url": "https://github.com/Rabiabbasi66/Fazal-Rabbi-portfolio",
        "demo_url":  None,
        "featured": True,
        "order": 3
    },
    {
        "title": "E-Commerce Platform",
        "description": "Complete full-stack shopping platform with authentication, cart, orders and payment integration.",
        "image": "http://127.0.0.1:8000/images/ecommerce.jpg",
        "tags": ["FastAPI", "MongoDB", "JavaScript", "HTML", "CSS"],
        "github_url": None,
       "demo_url":  None,
        "featured": False,
        "order": 4
    },
    {
        "title": "AI Chat Application",
        "description": "AI-powered chatbot with real-time messaging and intelligent responses.",
        "image": "http://127.0.0.1:8000/images/ai-chat.jpg",
        "tags": ["Python", "FastAPI", "AI", "JavaScript"],
        "github_url": "https://github.com/Rabiabbasi66/Ai-chat-bot",
        "demo_url": None,
        "featured": False,
        "order": 5
    },
    {
        "title": "Task Management App",
        "description": "Task management application with drag-and-drop interface, authentication and team collaboration.",
        "image": "http://127.0.0.1:8000/images/task-manager.jpg",
        "tags": ["HTML", "CSS", "JavaScript", "MongoDB"],
        "github_url": "https://github.com/Rabiabbasi66/task-managnment-app",
        "demo_url":  None,
        "featured": False,
        "order": 6
    }
]

for project in projects:
    project["created_at"] = now
    project["updated_at"] = now


collection.delete_many({})


collection.insert_many(projects)

print(f"✅ Inserted {len(projects)} projects successfully!")

print(f"✅ Inserted {len(projects)} projects successfully!")
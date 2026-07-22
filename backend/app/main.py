from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import (
    auth_router,
    contact_router,
    projects_router,
    skills_router,
    services_router
)

# ✅ ADD THIS LIFESPAN FUNCTION - This was missing
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    try:
        await connect_to_mongo()
        print("🚀 Application startup complete")
    except Exception as e:
        print(f"⚠️ Could not connect to Mongo on startup: {e}")
    
    yield  # This is where the app runs
    
    # Shutdown
    try:
        await close_mongo_connection()
        print("👋 Application shutdown complete")
    except Exception as e:
        print(f"⚠️ Error closing Mongo connection: {e}")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Portfolio Website",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan  # ✅ Now this exists
)

# ✅ CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# ✅ ROOT ENDPOINTS
@app.get("/")
async def root():
    return {
        "message": "Welcome to Portfolio Backend API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/api")
async def api_root():
    return {
        "message": "Welcome to Portfolio Backend API",
        "version": settings.APP_VERSION,
        "endpoints": {
            "auth": "/api/auth",
            "contact": "/api/contact",
            "projects": "/api/projects",
            "skills": "/api/skills",
            "services": "/api/services"
        },
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }

# Include routers
# Include routers - ✅ REMOVE the prefix here since it's already in the router files
app.include_router(auth_router)
app.include_router(contact_router)
app.include_router(projects_router)
app.include_router(skills_router)
app.include_router(services_router)
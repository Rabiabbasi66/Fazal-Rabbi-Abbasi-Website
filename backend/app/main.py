from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings  # ✅ Import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import (
    auth_router,
    contact_router,
    projects_router,
    skills_router,
    services_router
)

# ... your lifespan function ...

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Portfolio Website",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ✅ CORS MIDDLEWARE - Using settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # ✅ Uses settings
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
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(contact_router, prefix="/api/contact", tags=["Contact"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(skills_router, prefix="/api/skills", tags=["Skills"])
app.include_router(services_router, prefix="/api/services", tags=["Services"])
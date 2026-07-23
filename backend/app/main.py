from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import connect_to_mongo, close_mongo_connection
from app.routes import (
    auth_router,
    contact_router,
    projects_router,
    skills_router,
    services_router,
)

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
    lifespan=lifespan,
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
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# ROOT ROUTES
# =====================================================
@app.get("/")
async def root():
    return {
        "message": "Welcome to Portfolio API",
        "version": "1.0.0",
    }


@app.get("/api")
async def api_root():
    return {
        "status": "ok",
        "message": "API is working",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
    }


# =====================================================
# REGISTER ROUTERS
# =====================================================
app.include_router(auth_router)
app.include_router(contact_router)
app.include_router(projects_router)
app.include_router(skills_router)
app.include_router(services_router)


# =====================================================
# RUN LOCALLY
# =====================================================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
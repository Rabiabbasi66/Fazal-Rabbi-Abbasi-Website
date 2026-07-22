from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI on Vercel"}

@app.get("/api")
async def api_root():
    return {"status": "ok", "message": "API is working"}

@app.get("/projects")
async def get_projects():
    return [
        {"id": "1", "title": "Test Project 1"},
        {"id": "2", "title": "Test Project 2"}
    ]

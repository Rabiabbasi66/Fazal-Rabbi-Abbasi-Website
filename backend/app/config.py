from typing import List
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    """Application settings"""
    
    # ✅ All fields MUST have type annotations
    APP_NAME: str = "Portfolio API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # ✅ CORS_ORIGINS with type annotation
    CORS_ORIGINS: List[str] = [
        "https://fazal-rabbi-abbasi-website.vercel.app",
        "https://fazal-rabbi-abbasi-website-dcbx.vercel.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # MongoDB settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "portfolio_db"
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-this"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # ✅ Use model_config instead of Config class
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

# Create settings instance
settings = Settings()
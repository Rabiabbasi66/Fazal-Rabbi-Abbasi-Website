from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "portfolio_db"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5500",
        "https://fazal-rabbi-abbasi-website.vercel.app"
    ]

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM: str
    ADMIN_EMAIL: str = "Rabif1820@gmail.com"

    # Application
    APP_NAME: str = "Portfolio Backend API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Upload
    MAX_UPLOAD_SIZE: int = 5242880
    ALLOWED_EXTENSIONS: List[str] = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "pdf"
    ]
    UPLOAD_DIR: str = "uploads"

    # Rate limit
    RATE_LIMIT_PER_MINUTE: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()
"""
Configuration settings for MedIntel
"""
import os
import logging
from typing import Optional
from pydantic_settings import BaseSettings


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


class Settings(BaseSettings):
    """Application settings"""

    # App
    APP_NAME: str = "MedIntel"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: Optional[str] = None

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL_WHISPER: str = "whisper-1"
    OPENAI_MODEL_GPT: str = "gpt-4"

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

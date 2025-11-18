"""
Configurações centralizadas da aplicação
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configurações da aplicação"""

    # App
    APP_NAME: str = "MedIntel API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str

    # OpenAI
    OPENAI_API_KEY: str
    WHISPER_MODEL: str = "whisper-1"
    GPT_MODEL: str = "gpt-4-turbo-preview"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # File Upload
    MAX_UPLOAD_SIZE: int = 104857600  # 100MB
    ALLOWED_AUDIO_FORMATS: list = [".mp3", ".wav", ".m4a", ".ogg"]

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000"]

    # Monitoring
    SENTRY_DSN: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

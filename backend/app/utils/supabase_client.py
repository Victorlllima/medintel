from supabase import create_client, Client
from app.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class SupabaseClient:
    _instance: Optional[Client] = None

    @classmethod
    def get_client(cls) -> Client:
        """Get Supabase client instance (singleton)"""
        if cls._instance is None:
            try:
                cls._instance = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY
                )
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {str(e)}")
                raise
        return cls._instance

    @classmethod
    def get_admin_client(cls) -> Client:
        """Get Supabase client with service role key for admin operations"""
        if settings.SUPABASE_SERVICE_ROLE_KEY:
            return create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
        return cls.get_client()


def get_supabase() -> Client:
    """Dependency for FastAPI routes"""
    return SupabaseClient.get_client()

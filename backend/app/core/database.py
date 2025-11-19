"""
Database connection using Supabase
"""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Singleton Supabase client
_supabase_client: Optional[Client] = None


def get_supabase() -> Client:
    """
    Get or create Supabase client instance

    Returns:
        Supabase client instance
    """
    global _supabase_client

    if _supabase_client is None:
        logger.info("Creating Supabase client...")
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        logger.info("Supabase client created successfully")

    return _supabase_client


def get_supabase_admin() -> Client:
    """
    Get Supabase client with service role key (admin access)

    Returns:
        Supabase admin client instance
    """
    if settings.SUPABASE_SERVICE_KEY:
        return create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
    else:
        logger.warning("SUPABASE_SERVICE_KEY not set, using regular key")
        return get_supabase()

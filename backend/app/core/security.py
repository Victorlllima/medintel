"""
Security Module - Authentication and Authorization
"""
from typing import Optional
from pydantic import BaseModel


class User(BaseModel):
    """User model for authentication"""
    id: str
    email: str
    full_name: str
    crm: str


async def get_current_user() -> User:
    """
    Dependency to get current authenticated user
    This is a placeholder - implement with actual auth logic
    """
    # TODO: Implement actual authentication
    return User(
        id="user-123",
        email="doctor@example.com",
        full_name="Dr. Example",
        crm="12345"
    )

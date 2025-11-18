"""
Audit log schemas
"""
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from enum import Enum


class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    VIEW = "view"
    DOWNLOAD = "download"
    EXPORT = "export"


class AuditResource(str, Enum):
    USER = "user"
    PATIENT = "patient"
    CONSULTATION = "consultation"
    DOCUMENT = "document"
    TRANSCRIPTION = "transcription"


class AuditLogCreate(BaseModel):
    user_id: str
    action: AuditAction
    resource: AuditResource
    resource_id: str
    changes: Optional[dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    action: AuditAction
    resource: AuditResource
    resource_id: str
    changes: Optional[dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    DOCTOR = "doctor"
    ADMIN = "admin"
    STAFF = "staff"


class User(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: UserRole = UserRole.DOCTOR


class DoctorInfo(BaseModel):
    """Doctor information for document generation"""
    full_name: str
    crm: str = Field(..., description="CRM (Registro médico)")
    specialty: Optional[str] = Field(None, description="Especialidade médica")
    address: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Dr. João Silva",
                "crm": "CRM/SP 123456",
                "specialty": "Clínico Geral",
                "address": "Rua das Flores, 123 - São Paulo/SP",
                "phone": "(11) 98765-4321"
            }
        }

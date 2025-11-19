from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from enum import Enum


class Gender(str, Enum):
    MALE = "M"
    FEMALE = "F"
    OTHER = "Other"


class Patient(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str
    full_name: str
    date_of_birth: date
    gender: Gender
    cpf: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    date_of_birth: date
    gender: Gender
    cpf: str = Field(..., min_length=11, max_length=14)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "Maria",
                "last_name": "Silva",
                "date_of_birth": "1990-05-15",
                "gender": "F",
                "cpf": "123.456.789-00",
                "email": "maria.silva@email.com",
                "phone": "(11) 98765-4321"
            }
        }

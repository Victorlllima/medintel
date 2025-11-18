"""
Patient schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class PatientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    cpf: str = Field(..., min_length=11, max_length=14)
    date_of_birth: date
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = None
    allergies: List[str] = Field(default_factory=list)
    medical_history: Optional[str] = None


class PatientCreate(PatientBase):
    consent_given: bool = Field(..., description="Consentimento LGPD")
    consent_date: datetime = Field(default_factory=datetime.utcnow)


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    allergies: Optional[List[str]] = None
    medical_history: Optional[str] = None


class PatientResponse(PatientBase):
    id: str
    user_id: str
    consent_given: bool
    consent_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

"""
Document schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class DocumentType(str, Enum):
    MEDICAL_CERTIFICATE = "medical_certificate"  # Atestado médico
    PRESCRIPTION = "prescription"  # Receita
    ATTENDANCE_DECLARATION = "attendance_declaration"  # Declaração de comparecimento


class DocumentFormat(str, Enum):
    PDF = "pdf"
    DOCX = "docx"


class MedicalCertificateData(BaseModel):
    days_off: int = Field(..., ge=1, le=365)
    start_date: date
    icd_code: Optional[str] = None
    observations: Optional[str] = None


class PrescriptionData(BaseModel):
    medications: list[dict]  # [{name, dosage, frequency, duration}]
    observations: Optional[str] = None


class AttendanceDeclarationData(BaseModel):
    date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    purpose: Optional[str] = None


class DocumentCreate(BaseModel):
    consultation_id: str
    patient_id: str
    document_type: DocumentType
    format: DocumentFormat = DocumentFormat.PDF
    data: dict  # MedicalCertificateData | PrescriptionData | AttendanceDeclarationData


class DocumentResponse(BaseModel):
    id: str
    consultation_id: str
    patient_id: str
    user_id: str
    document_type: DocumentType
    format: DocumentFormat
    file_url: str
    data: dict
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    page_size: int

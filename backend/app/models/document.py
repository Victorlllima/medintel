from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    MEDICAL_CERTIFICATE = "medical_certificate"
    PRESCRIPTION = "prescription"
    ATTENDANCE_DECLARATION = "attendance_declaration"


class DocumentStatus(str, Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    SIGNED = "signed"
    ARCHIVED = "archived"


class Medication(BaseModel):
    name: str = Field(..., description="Nome do medicamento")
    dosage: str = Field(..., description="Dosagem (ex: 500mg)")
    instructions: str = Field(..., description="Posologia (ex: 1 comprimido a cada 8 horas)")
    duration: Optional[str] = Field(None, description="Duração do tratamento")


class MedicalCertificateData(BaseModel):
    """Data specific to Medical Certificate"""
    days_off: int = Field(..., ge=1, description="Número de dias de afastamento")
    cid10: Optional[str] = Field(None, description="Código CID-10")
    notes: Optional[str] = Field(None, description="Observações adicionais")


class PrescriptionData(BaseModel):
    """Data specific to Prescription"""
    medications: List[Medication] = Field(..., description="Lista de medicamentos")
    instructions: Optional[str] = Field(None, description="Orientações gerais")
    validity_days: int = Field(30, description="Validade da receita em dias")


class AttendanceDeclarationData(BaseModel):
    """Data specific to Attendance Declaration"""
    start_time: str = Field(..., description="Hora de início (HH:MM)")
    end_time: Optional[str] = Field(None, description="Hora de término (HH:MM)")
    duration_minutes: int = Field(30, description="Duração em minutos")


class DocumentCreate(BaseModel):
    consultation_id: str = Field(..., description="ID da consulta")
    document_type: DocumentType = Field(..., description="Tipo de documento")
    additional_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Dados adicionais específicos do tipo de documento"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "consultation_id": "123e4567-e89b-12d3-a456-426614174000",
                "document_type": "medical_certificate",
                "additional_data": {
                    "days_off": 3,
                    "cid10": "J06.9",
                    "notes": "Repouso absoluto"
                }
            }
        }


class DocumentResponse(BaseModel):
    id: str
    consultation_id: str
    patient_id: str
    document_type: DocumentType
    document_title: str
    file_path: str
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: str = "application/pdf"
    generated_by: str
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    page_size: int

"""
Schemas Pydantic para Consultas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ConsultationStatus(str, Enum):
    """Status possíveis de uma consulta"""
    UPLOADING = "uploading"
    QUEUED = "queued"
    TRANSCRIBING = "transcribing"
    SUMMARIZING = "summarizing"
    COMPLETED = "completed"
    FAILED = "failed"


class Prescription(BaseModel):
    """Modelo de prescrição"""
    name: str
    dosage: str
    frequency: str


class CID10Suggestion(BaseModel):
    """Sugestão de CID-10"""
    code: str
    description: str


class ConsultationSummary(BaseModel):
    """Resumo estruturado da consulta"""
    chief_complaint: Optional[str] = None
    history_present_illness: Optional[str] = None
    physical_examination: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    prescriptions: Optional[List[Prescription]] = None
    cid10_suggestions: Optional[List[CID10Suggestion]] = None


class ConsultationCreate(BaseModel):
    """Schema para criação de consulta"""
    patient_id: str
    doctor_id: str
    audio_file_name: str
    duration_seconds: Optional[int] = None


class ConsultationUpdate(BaseModel):
    """Schema para atualização de consulta"""
    status: Optional[ConsultationStatus] = None
    transcription: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None


class ConsultationResponse(BaseModel):
    """Schema de resposta de consulta"""
    id: str
    patient_id: str
    doctor_id: str
    audio_file_path: str
    status: ConsultationStatus
    transcription: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    task_id: Optional[str] = None

    class Config:
        from_attributes = True


class ConsultationList(BaseModel):
    """Schema para lista de consultas"""
    consultations: List[ConsultationResponse]
    total: int
    page: int
    page_size: int

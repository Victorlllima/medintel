"""
Consultation schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ConsultationStatus(str, Enum):
    UPLOADING = "uploading"
    QUEUED = "queued"
    TRANSCRIBING = "transcribing"
    SUMMARIZING = "summarizing"
    COMPLETED = "completed"
    FAILED = "failed"


class TranscriptionSegment(BaseModel):
    text: str
    start: float
    end: float
    confidence: Optional[float] = None


class SummaryStructure(BaseModel):
    chief_complaint: Optional[str] = None  # Queixa principal
    hda: Optional[str] = None  # História da doença atual
    physical_exam: Optional[str] = None  # Exame físico
    assessment: Optional[str] = None  # Avaliação/Hipótese diagnóstica
    plan: Optional[str] = None  # Conduta/Plano terapêutico


class CIDSuggestion(BaseModel):
    code: str
    description: str
    confidence: float


class ConsultationCreate(BaseModel):
    patient_id: str
    audio_file: str  # URL do arquivo no storage
    duration: Optional[float] = None


class ConsultationUpdate(BaseModel):
    transcription: Optional[str] = None
    summary: Optional[SummaryStructure] = None
    icd_codes: Optional[List[str]] = None


class ConsultationResponse(BaseModel):
    id: str
    patient_id: str
    user_id: str
    audio_url: str
    duration: Optional[float] = None
    status: ConsultationStatus
    transcription: Optional[str] = None
    transcription_segments: Optional[List[TranscriptionSegment]] = None
    summary: Optional[SummaryStructure] = None
    icd_suggestions: Optional[List[CIDSuggestion]] = None
    icd_codes: Optional[List[str]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConsultationListResponse(BaseModel):
    consultations: List[ConsultationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

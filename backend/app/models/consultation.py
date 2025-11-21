from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ConsultationStatus(str, Enum):
    DRAFT = "draft"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Consultation(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    consultation_date: datetime
    chief_complaint: Optional[str] = None
    history_of_present_illness: Optional[str] = None
    physical_examination: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    medications_prescribed: Optional[List[Dict[str, Any]]] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    status: ConsultationStatus = ConsultationStatus.DRAFT
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConsultationCreate(BaseModel):
    patient_id: str
    consultation_date: datetime
    chief_complaint: Optional[str] = None
    history_of_present_illness: Optional[str] = None
    physical_examination: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    medications_prescribed: Optional[List[Dict[str, Any]]] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    status: ConsultationStatus = ConsultationStatus.DRAFT

    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "123e4567-e89b-12d3-a456-426614174000",
                "consultation_date": "2024-01-15T10:30:00",
                "chief_complaint": "Dor de cabeça persistente",
                "diagnosis": "Cefaleia tensional",
                "treatment_plan": "Analgésicos e repouso",
                "status": "completed"
            }
        }

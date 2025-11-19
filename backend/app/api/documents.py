"""
Documents API - Endpoints for PDF Generation
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import datetime

from app.core.security import get_current_user
from app.core.database import get_supabase
from app.services.document_service import get_document_service

router = APIRouter()

# Schemas
class MedicationInput(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str


class GenerateCertificateInput(BaseModel):
    consultation_id: str
    icd_code: str
    icd_description: str
    days_off: int
    start_date: Optional[str] = None


class GeneratePrescriptionInput(BaseModel):
    consultation_id: str
    medications: List[MedicationInput]


class GenerateDeclarationInput(BaseModel):
    consultation_id: str
    start_time: str  # "14:00"
    end_time: str    # "15:30"


@router.post("/generate/certificate")
async def generate_certificate(
    input_data: GenerateCertificateInput,
    current_user = Depends(get_current_user)
):
    """
    Gera atestado médico em PDF
    """
    supabase = get_supabase()
    doc_service = get_document_service()

    # Buscar dados da consulta e paciente
    result = await supabase.table("consultations").select(
        "*, patients(name, date_of_birth)"
    ).eq("id", input_data.consultation_id).eq("user_id", current_user.id).single().execute()

    if not result.get("data"):
        raise HTTPException(status_code=404, detail="Consulta não encontrada")

    consultation = result["data"]
    patient_name = consultation["patients"]["name"]

    # Gerar PDF
    start_date = datetime.date.fromisoformat(input_data.start_date) if input_data.start_date else datetime.date.today()

    pdf_buffer = doc_service.generate_medical_certificate(
        patient_name=patient_name,
        doctor_name=current_user.full_name,
        doctor_crm=current_user.crm,
        icd_code=input_data.icd_code,
        icd_description=input_data.icd_description,
        days_off=input_data.days_off,
        start_date=start_date
    )

    # Upload para Supabase Storage
    file_name = f"{input_data.consultation_id}_certificate_{datetime.datetime.now().timestamp()}.pdf"

    await supabase.storage.from_("documents").upload(
        file_name,
        pdf_buffer.getvalue()
    )

    # Obter URL pública
    url_result = supabase.storage.from_("documents").get_public_url(file_name)

    # Criar registro no banco
    await supabase.table("documents").insert({
        "consultation_id": input_data.consultation_id,
        "patient_id": consultation.get("patient_id"),
        "user_id": current_user.id,
        "document_type": "medical_certificate",
        "format": "pdf",
        "file_url": url_result["data"]["publicUrl"],
        "data": {
            "icd_code": input_data.icd_code,
            "icd_description": input_data.icd_description,
            "days_off": input_data.days_off,
            "start_date": str(start_date)
        }
    }).execute()

    # Retornar PDF como download
    pdf_buffer.seek(0)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=atestado_{patient_name.replace(' ', '_')}.pdf"
        }
    )


@router.post("/generate/prescription")
async def generate_prescription(
    input_data: GeneratePrescriptionInput,
    current_user = Depends(get_current_user)
):
    """
    Gera receita médica em PDF
    """
    supabase = get_supabase()
    doc_service = get_document_service()

    # Buscar dados
    result = await supabase.table("consultations").select(
        "*, patients(name, date_of_birth)"
    ).eq("id", input_data.consultation_id).eq("user_id", current_user.id).single().execute()

    if not result.get("data"):
        raise HTTPException(status_code=404, detail="Consulta não encontrada")

    consultation = result["data"]
    patient_name = consultation["patients"]["name"]

    # Calcular idade
    dob = datetime.datetime.fromisoformat(consultation["patients"]["date_of_birth"])
    patient_age = (datetime.datetime.now() - dob).days // 365

    # Converter medications para dict
    medications = [med.dict() for med in input_data.medications]

    # Gerar PDF
    pdf_buffer = doc_service.generate_prescription(
        patient_name=patient_name,
        patient_age=patient_age,
        doctor_name=current_user.full_name,
        doctor_crm=current_user.crm,
        medications=medications
    )

    # Upload para Supabase Storage
    file_name = f"{input_data.consultation_id}_prescription_{datetime.datetime.now().timestamp()}.pdf"

    await supabase.storage.from_("documents").upload(
        file_name,
        pdf_buffer.getvalue()
    )

    # Obter URL pública
    url_result = supabase.storage.from_("documents").get_public_url(file_name)

    # Criar registro no banco
    await supabase.table("documents").insert({
        "consultation_id": input_data.consultation_id,
        "patient_id": consultation.get("patient_id"),
        "user_id": current_user.id,
        "document_type": "prescription",
        "format": "pdf",
        "file_url": url_result["data"]["publicUrl"],
        "data": {
            "medications": medications
        }
    }).execute()

    # Retornar PDF como download
    pdf_buffer.seek(0)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=receita_{patient_name.replace(' ', '_')}.pdf"
        }
    )


@router.post("/generate/declaration")
async def generate_declaration(
    input_data: GenerateDeclarationInput,
    current_user = Depends(get_current_user)
):
    """
    Gera declaração de comparecimento em PDF
    """
    supabase = get_supabase()
    doc_service = get_document_service()

    # Buscar dados
    result = await supabase.table("consultations").select(
        "*, patients(name), created_at"
    ).eq("id", input_data.consultation_id).eq("user_id", current_user.id).single().execute()

    if not result.get("data"):
        raise HTTPException(status_code=404, detail="Consulta não encontrada")

    consultation = result["data"]
    patient_name = consultation["patients"]["name"]
    consultation_date = datetime.datetime.fromisoformat(consultation["created_at"]).date()

    # Gerar PDF
    pdf_buffer = doc_service.generate_attendance_declaration(
        patient_name=patient_name,
        doctor_name=current_user.full_name,
        doctor_crm=current_user.crm,
        consultation_date=consultation_date,
        start_time=input_data.start_time,
        end_time=input_data.end_time
    )

    # Upload para Supabase Storage
    file_name = f"{input_data.consultation_id}_declaration_{datetime.datetime.now().timestamp()}.pdf"

    await supabase.storage.from_("documents").upload(
        file_name,
        pdf_buffer.getvalue()
    )

    # Obter URL pública
    url_result = supabase.storage.from_("documents").get_public_url(file_name)

    # Criar registro no banco
    await supabase.table("documents").insert({
        "consultation_id": input_data.consultation_id,
        "patient_id": consultation.get("patient_id"),
        "user_id": current_user.id,
        "document_type": "attendance_declaration",
        "format": "pdf",
        "file_url": url_result["data"]["publicUrl"],
        "data": {
            "consultation_date": str(consultation_date),
            "start_time": input_data.start_time,
            "end_time": input_data.end_time
        }
    }).execute()

    # Retornar PDF como download
    pdf_buffer.seek(0)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=declaracao_{patient_name.replace(' ', '_')}.pdf"
        }
    )


@router.get("/")
async def list_documents(
    consultation_id: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """
    Lista documentos gerados
    """
    supabase = get_supabase()

    query = supabase.table("documents").select("*").eq("user_id", current_user.id)

    if consultation_id:
        query = query.eq("consultation_id", consultation_id)

    result = await query.order("created_at", desc=True).execute()

    return result.get("data", [])

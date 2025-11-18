"""
Consultation endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form, Query
from typing import Optional
import os

from app.core.database import get_supabase
from app.core.security import get_current_user
from app.core.config import settings
from app.schemas.user import TokenData
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationUpdate,
    ConsultationResponse,
    ConsultationListResponse,
    ConsultationStatus
)
from app.workers.tasks import process_consultation

router = APIRouter()


@router.post("/upload", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
async def upload_consultation_audio(
    patient_id: str = Form(...),
    audio_file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """Upload audio file and create consultation"""
    supabase = get_supabase()

    # Validate file size
    content = await audio_file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum of {settings.MAX_UPLOAD_SIZE} bytes"
        )

    # Validate file format
    file_ext = os.path.splitext(audio_file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_AUDIO_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File format not allowed. Allowed formats: {settings.ALLOWED_AUDIO_FORMATS}"
        )

    # Verify patient exists and belongs to user
    patient = supabase.table("patients").select("*").eq("id", patient_id).eq("user_id", current_user.user_id).execute()

    if not patient.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Upload to Supabase Storage
    file_path = f"{current_user.user_id}/{patient_id}/{audio_file.filename}"

    try:
        supabase.storage.from_("consultations").upload(
            file_path,
            content,
            {"content-type": audio_file.content_type}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

    # Get public URL
    audio_url = supabase.storage.from_("consultations").get_public_url(file_path)

    # Create consultation record
    consultation_data = {
        "patient_id": patient_id,
        "user_id": current_user.user_id,
        "audio_url": audio_url,
        "status": ConsultationStatus.QUEUED.value
    }

    result = supabase.table("consultations").insert(consultation_data).execute()
    consultation = result.data[0]

    # Queue processing task
    process_consultation.delay(consultation["id"])

    return ConsultationResponse(**consultation)


@router.get("", response_model=ConsultationListResponse)
async def list_consultations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    patient_id: Optional[str] = None,
    status: Optional[ConsultationStatus] = None,
    current_user: TokenData = Depends(get_current_user)
):
    """List consultations with filters"""
    supabase = get_supabase()

    query = supabase.table("consultations").select("*", count="exact").eq("user_id", current_user.user_id)

    if patient_id:
        query = query.eq("patient_id", patient_id)

    if status:
        query = query.eq("status", status.value)

    offset = (page - 1) * page_size
    query = query.range(offset, offset + page_size - 1).order("created_at", desc=True)

    result = query.execute()

    total = result.count if result.count else 0
    total_pages = (total + page_size - 1) // page_size

    return ConsultationListResponse(
        consultations=[ConsultationResponse(**c) for c in result.data],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get a specific consultation"""
    supabase = get_supabase()

    result = supabase.table("consultations").select("*").eq("id", consultation_id).eq("user_id", current_user.user_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )

    return ConsultationResponse(**result.data[0])


@router.patch("/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: str,
    consultation_update: ConsultationUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update consultation (edit transcription, summary, ICD codes)"""
    supabase = get_supabase()

    # Verify consultation exists
    existing = supabase.table("consultations").select("*").eq("id", consultation_id).eq("user_id", current_user.user_id).execute()

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )

    # Update consultation
    update_data = consultation_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    result = supabase.table("consultations").update(update_data).eq("id", consultation_id).execute()

    # Create audit log
    audit_log = {
        "user_id": current_user.user_id,
        "action": "update",
        "resource": "consultation",
        "resource_id": consultation_id,
        "changes": update_data
    }
    supabase.table("audit_logs").insert(audit_log).execute()

    return ConsultationResponse(**result.data[0])


@router.delete("/{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_consultation(
    consultation_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a consultation"""
    supabase = get_supabase()

    # Verify consultation exists
    existing = supabase.table("consultations").select("*").eq("id", consultation_id).eq("user_id", current_user.user_id).execute()

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )

    # Delete from storage
    # (implement storage cleanup)

    # Delete consultation
    supabase.table("consultations").delete().eq("id", consultation_id).execute()

    return None

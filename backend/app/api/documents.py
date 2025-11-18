"""
Document generation endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import FileResponse
from typing import Optional
import os

from app.core.database import get_supabase
from app.core.security import get_current_user
from app.schemas.user import TokenData
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentListResponse,
    DocumentType
)
from app.services.document_generator import DocumentGenerator

router = APIRouter()


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def generate_document(
    document_data: DocumentCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Generate a medical document (certificate, prescription, declaration)"""
    supabase = get_supabase()

    # Verify consultation exists
    consultation = supabase.table("consultations").select("*").eq("id", document_data.consultation_id).eq("user_id", current_user.user_id).execute()

    if not consultation.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )

    # Verify patient exists
    patient = supabase.table("patients").select("*").eq("id", document_data.patient_id).eq("user_id", current_user.user_id).execute()

    if not patient.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Get user info
    user = supabase.table("users").select("*").eq("id", current_user.user_id).execute()

    # Generate document
    generator = DocumentGenerator()

    try:
        file_path = generator.generate(
            document_type=document_data.document_type,
            format=document_data.format,
            patient=patient.data[0],
            user=user.data[0],
            consultation=consultation.data[0],
            data=document_data.data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate document: {str(e)}"
        )

    # Upload to storage
    with open(file_path, "rb") as f:
        content = f.read()

    storage_path = f"{current_user.user_id}/documents/{os.path.basename(file_path)}"

    try:
        supabase.storage.from_("documents").upload(
            storage_path,
            content,
            {"content-type": "application/pdf" if document_data.format.value == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

    # Get public URL
    file_url = supabase.storage.from_("documents").get_public_url(storage_path)

    # Create document record
    document_record = {
        "consultation_id": document_data.consultation_id,
        "patient_id": document_data.patient_id,
        "user_id": current_user.user_id,
        "document_type": document_data.document_type.value,
        "format": document_data.format.value,
        "file_url": file_url,
        "data": document_data.data
    }

    result = supabase.table("documents").insert(document_record).execute()

    # Clean up temp file
    os.remove(file_path)

    # Create audit log
    audit_log = {
        "user_id": current_user.user_id,
        "action": "create",
        "resource": "document",
        "resource_id": result.data[0]["id"]
    }
    supabase.table("audit_logs").insert(audit_log).execute()

    return DocumentResponse(**result.data[0])


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    patient_id: Optional[str] = None,
    consultation_id: Optional[str] = None,
    document_type: Optional[DocumentType] = None,
    current_user: TokenData = Depends(get_current_user)
):
    """List documents with filters"""
    supabase = get_supabase()

    query = supabase.table("documents").select("*", count="exact").eq("user_id", current_user.user_id)

    if patient_id:
        query = query.eq("patient_id", patient_id)

    if consultation_id:
        query = query.eq("consultation_id", consultation_id)

    if document_type:
        query = query.eq("document_type", document_type.value)

    offset = (page - 1) * page_size
    query = query.range(offset, offset + page_size - 1).order("created_at", desc=True)

    result = query.execute()

    total = result.count if result.count else 0

    return DocumentListResponse(
        documents=[DocumentResponse(**d) for d in result.data],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get a specific document"""
    supabase = get_supabase()

    result = supabase.table("documents").select("*").eq("id", document_id).eq("user_id", current_user.user_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Create audit log for view
    audit_log = {
        "user_id": current_user.user_id,
        "action": "view",
        "resource": "document",
        "resource_id": document_id
    }
    supabase.table("audit_logs").insert(audit_log).execute()

    return DocumentResponse(**result.data[0])

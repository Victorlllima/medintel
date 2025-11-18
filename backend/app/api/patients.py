"""
Patient management endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional

from app.core.database import get_supabase
from app.core.security import get_current_user
from app.schemas.user import TokenData
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientListResponse
)

router = APIRouter()


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new patient"""
    supabase = get_supabase()

    # Check if CPF already exists for this user
    existing = supabase.table("patients").select("*").eq("cpf", patient_data.cpf).eq("user_id", current_user.user_id).execute()

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient with this CPF already exists"
        )

    # Create patient
    patient_dict = patient_data.model_dump()
    patient_dict["user_id"] = current_user.user_id

    result = supabase.table("patients").insert(patient_dict).execute()

    return PatientResponse(**result.data[0])


@router.get("", response_model=PatientListResponse)
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user)
):
    """List all patients for current user with pagination and search"""
    supabase = get_supabase()

    # Build query
    query = supabase.table("patients").select("*", count="exact").eq("user_id", current_user.user_id)

    # Apply search filter
    if search:
        query = query.or_(f"name.ilike.%{search}%,cpf.ilike.%{search}%")

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.range(offset, offset + page_size - 1).order("created_at", desc=True)

    result = query.execute()

    total = result.count if result.count else 0
    total_pages = (total + page_size - 1) // page_size

    return PatientListResponse(
        patients=[PatientResponse(**p) for p in result.data],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get a specific patient"""
    supabase = get_supabase()

    result = supabase.table("patients").select("*").eq("id", patient_id).eq("user_id", current_user.user_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    return PatientResponse(**result.data[0])


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_update: PatientUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a patient"""
    supabase = get_supabase()

    # Check if patient exists and belongs to user
    existing = supabase.table("patients").select("*").eq("id", patient_id).eq("user_id", current_user.user_id).execute()

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Update patient
    update_data = patient_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    result = supabase.table("patients").update(update_data).eq("id", patient_id).execute()

    return PatientResponse(**result.data[0])


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a patient (LGPD - right to be forgotten)"""
    supabase = get_supabase()

    # Check if patient exists and belongs to user
    existing = supabase.table("patients").select("*").eq("id", patient_id).eq("user_id", current_user.user_id).execute()

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Delete patient (cascading deletes handled by DB)
    supabase.table("patients").delete().eq("id", patient_id).execute()

    return None

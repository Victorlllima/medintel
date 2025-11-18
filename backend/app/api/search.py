"""
Search endpoints
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime

from app.core.database import get_supabase
from app.core.security import get_current_user
from app.schemas.user import TokenData
from app.schemas.consultation import ConsultationResponse

router = APIRouter()


@router.get("/consultations")
async def search_consultations(
    query: str = Query(..., min_length=1),
    patient_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: TokenData = Depends(get_current_user)
):
    """Search consultations by transcription content, patient, and date range"""
    supabase = get_supabase()

    # Build base query
    db_query = supabase.table("consultations").select("*", count="exact").eq("user_id", current_user.user_id)

    # Apply filters
    if patient_id:
        db_query = db_query.eq("patient_id", patient_id)

    if start_date:
        db_query = db_query.gte("created_at", start_date.isoformat())

    if end_date:
        db_query = db_query.lte("created_at", end_date.isoformat())

    # Search in transcription (full-text search)
    db_query = db_query.textSearch("transcription", query)

    # Pagination
    offset = (page - 1) * page_size
    db_query = db_query.range(offset, offset + page_size - 1).order("created_at", desc=True)

    result = db_query.execute()

    total = result.count if result.count else 0
    total_pages = (total + page_size - 1) // page_size

    return {
        "consultations": [ConsultationResponse(**c) for c in result.data],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "query": query
    }

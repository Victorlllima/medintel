"""
Dashboard statistics endpoints
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from collections import Counter

from app.core.database import get_supabase
from app.core.security import get_current_user
from app.schemas.user import TokenData

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(current_user: TokenData = Depends(get_current_user)):
    """Get dashboard statistics"""
    supabase = get_supabase()

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Total consultations today
    consultations_today = supabase.table("consultations").select("*", count="exact").eq("user_id", current_user.user_id).gte("created_at", today_start.isoformat()).execute()

    # Total consultations this month
    consultations_month = supabase.table("consultations").select("*", count="exact").eq("user_id", current_user.user_id).gte("created_at", month_start.isoformat()).execute()

    # Active patients (patients with consultations this month)
    active_patients = supabase.table("consultations").select("patient_id").eq("user_id", current_user.user_id).gte("created_at", month_start.isoformat()).execute()

    unique_patients = len(set(c["patient_id"] for c in active_patients.data))

    # Total patients
    total_patients = supabase.table("patients").select("*", count="exact").eq("user_id", current_user.user_id).execute()

    # Top 5 ICD codes
    all_consultations = supabase.table("consultations").select("icd_codes").eq("user_id", current_user.user_id).gte("created_at", month_start.isoformat()).execute()

    icd_counter = Counter()
    for consultation in all_consultations.data:
        if consultation.get("icd_codes"):
            for code in consultation["icd_codes"]:
                icd_counter[code] += 1

    top_icds = [{"code": code, "count": count} for code, count in icd_counter.most_common(5)]

    # Average consultation duration (estimate from transcription time)
    completed_consultations = supabase.table("consultations").select("duration").eq("user_id", current_user.user_id).eq("status", "completed").gte("created_at", month_start.isoformat()).execute()

    avg_duration = 0
    if completed_consultations.data:
        durations = [c["duration"] for c in completed_consultations.data if c.get("duration")]
        if durations:
            avg_duration = sum(durations) / len(durations)

    # Consultations by day (last 7 days)
    consultations_by_day = []
    for i in range(7):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        count = supabase.table("consultations").select("*", count="exact").eq("user_id", current_user.user_id).gte("created_at", day_start.isoformat()).lt("created_at", day_end.isoformat()).execute()

        consultations_by_day.append({
            "date": day_start.date().isoformat(),
            "count": count.count or 0
        })

    consultations_by_day.reverse()

    return {
        "consultations_today": consultations_today.count or 0,
        "consultations_month": consultations_month.count or 0,
        "active_patients": unique_patients,
        "total_patients": total_patients.count or 0,
        "avg_consultation_duration": round(avg_duration, 2),
        "top_icds": top_icds,
        "consultations_by_day": consultations_by_day
    }

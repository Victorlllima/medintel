"""
Celery tasks for async processing
"""
from celery import Task
import tempfile
import os
import httpx
from datetime import datetime

from app.workers.celery_app import celery_app
from app.core.database import get_supabase
from app.services.openai_service import OpenAIService
from app.schemas.consultation import ConsultationStatus


class CallbackTask(Task):
    """Base task with callbacks"""

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure"""
        consultation_id = args[0] if args else None
        if consultation_id:
            supabase = get_supabase()
            supabase.table("consultations").update({
                "status": ConsultationStatus.FAILED.value,
                "error_message": str(exc)
            }).eq("id", consultation_id).execute()


@celery_app.task(bind=True, base=CallbackTask, name="process_consultation")
async def process_consultation(self, consultation_id: str):
    """
    Process consultation: download audio, transcribe, generate summary, suggest ICD codes

    Args:
        consultation_id: ID of the consultation to process
    """
    supabase = get_supabase()

    try:
        # Update status to transcribing
        supabase.table("consultations").update({
            "status": ConsultationStatus.TRANSCRIBING.value
        }).eq("id", consultation_id).execute()

        # Get consultation data
        consultation = supabase.table("consultations").select("*").eq("id", consultation_id).execute()

        if not consultation.data:
            raise ValueError(f"Consultation {consultation_id} not found")

        consultation_data = consultation.data[0]
        audio_url = consultation_data["audio_url"]

        # Download audio file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            with httpx.Client() as client:
                response = client.get(audio_url)
                response.raise_for_status()
                temp_audio.write(response.content)
                temp_audio_path = temp_audio.name

        # Transcribe audio
        openai_service = OpenAIService()
        transcription_result = await openai_service.transcribe_audio(temp_audio_path)

        # Update with transcription
        supabase.table("consultations").update({
            "transcription": transcription_result["text"],
            "transcription_segments": transcription_result["segments"],
            "status": ConsultationStatus.SUMMARIZING.value
        }).eq("id", consultation_id).execute()

        # Generate summary
        summary = await openai_service.generate_summary(transcription_result["text"])

        # Suggest ICD codes
        icd_suggestions = await openai_service.suggest_icd_codes(
            summary,
            transcription_result["text"]
        )

        # Update with summary and ICD suggestions
        supabase.table("consultations").update({
            "summary": summary.model_dump(),
            "icd_suggestions": [s.model_dump() for s in icd_suggestions],
            "status": ConsultationStatus.COMPLETED.value,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", consultation_id).execute()

        # Clean up temp file
        os.unlink(temp_audio_path)

        return {
            "consultation_id": consultation_id,
            "status": "completed"
        }

    except Exception as e:
        # Update status to failed
        supabase.table("consultations").update({
            "status": ConsultationStatus.FAILED.value,
            "error_message": str(e)
        }).eq("id", consultation_id).execute()

        raise

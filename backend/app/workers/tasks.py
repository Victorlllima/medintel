"""
Background tasks for processing consultations
"""
import os
import asyncio
import aiohttp
from app.core.config import settings
from app.core.database import get_supabase
from app.services.openai_service import get_openai_service
import logging

logger = logging.getLogger(__name__)

async def process_consultation(consultation_id: str):
    """
    Processa consulta: baixa áudio, transcreve, gera resumo, sugere CID

    Este é o pipeline completo de processamento
    """
    supabase = get_supabase()
    openai_service = get_openai_service(settings.OPENAI_API_KEY)

    try:
        logger.info(f"Iniciando processamento da consulta {consultation_id}")

        # 1. Atualizar status para "transcribing"
        await supabase.table("consultations").update({
            "status": "transcribing"
        }).eq("id", consultation_id).execute()

        # 2. Buscar dados da consulta
        result = await supabase.table("consultations").select(
            "*, patients(name, date_of_birth)"
        ).eq("id", consultation_id).single().execute()

        consultation = result.data
        audio_url = consultation["audio_url"]
        patient_name = consultation["patients"]["name"]

        # Calcular idade do paciente
        from datetime import datetime
        dob = datetime.fromisoformat(consultation["patients"]["date_of_birth"])
        patient_age = (datetime.now() - dob).days // 365

        # 3. Download do áudio do Supabase Storage
        logger.info(f"Baixando áudio de: {audio_url}")
        temp_audio_path = f"/tmp/{consultation_id}.audio"

        async with aiohttp.ClientSession() as session:
            async with session.get(audio_url) as resp:
                if resp.status == 200:
                    with open(temp_audio_path, 'wb') as f:
                        f.write(await resp.read())
                else:
                    raise Exception(f"Falha ao baixar áudio: HTTP {resp.status}")

        # 4. Transcrever áudio
        logger.info("Transcrevendo áudio...")
        transcription_result = await openai_service.transcribe_audio(temp_audio_path)

        # Atualizar com transcrição
        await supabase.table("consultations").update({
            "transcription": transcription_result["text"],
            "transcription_segments": transcription_result.get("segments", []),
            "duration": transcription_result.get("duration"),
            "status": "summarizing"
        }).eq("id", consultation_id).execute()

        logger.info("Transcrição concluída, gerando resumo...")

        # 5. Gerar resumo estruturado
        summary = await openai_service.generate_clinical_summary(
            transcription_result["text"],
            patient_name,
            patient_age
        )

        # 6. Sugerir CID-10
        logger.info("Sugerindo códigos CID-10...")
        icd_suggestions = await openai_service.suggest_icd10(summary)

        # 7. Atualizar consulta com todos os dados
        await supabase.table("consultations").update({
            "summary": summary,
            "icd_suggestions": icd_suggestions,
            "status": "completed",
            "completed_at": "now()"
        }).eq("id", consultation_id).execute()

        logger.info(f"Processamento concluído com sucesso: {consultation_id}")

        # 8. Limpar arquivo temporário
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

    except Exception as e:
        logger.error(f"Erro no processamento: {str(e)}")

        # Atualizar status para "failed"
        await supabase.table("consultations").update({
            "status": "failed",
            "error_message": str(e)
        }).eq("id", consultation_id).execute()

        raise


# Helper para rodar task assíncrona
def run_async_task(consultation_id: str):
    """Wrapper para rodar task assíncrona em contexto síncrono"""
    asyncio.run(process_consultation(consultation_id))

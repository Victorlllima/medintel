"""
Tarefas Celery para processamento assíncrono de consultas
"""
import tempfile
import os
from typing import Dict, Any
from celery import Task
from openai import OpenAI
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.workers.celery_app import celery_app
from app.core.config import settings


# Configurar clientes
openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Configurar database
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class ConsultationTask(Task):
    """Task base com tratamento de erros"""

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Chamado quando a task falha"""
        consultation_id = args[0] if args else None
        if consultation_id:
            update_consultation_status(consultation_id, "failed", error_message=str(exc))


def update_consultation_status(
    consultation_id: str,
    status: str,
    transcription: str = None,
    summary: Dict[str, Any] = None,
    error_message: str = None
):
    """Atualiza o status da consulta no banco de dados"""
    db = SessionLocal()
    try:
        update_data = {"status": status}

        if transcription is not None:
            update_data["transcription"] = transcription

        if summary is not None:
            update_data["summary"] = summary

        if error_message is not None:
            update_data["error_message"] = error_message

        # Atualizar no banco usando SQL raw (ajustar conforme seu ORM)
        from sqlalchemy import text

        # Construir query de update dinamicamente
        set_clauses = [f"{key} = :{key}" for key in update_data.keys()]
        query = text(f"UPDATE consultations SET {', '.join(set_clauses)} WHERE id = :id")

        db.execute(query, {"id": consultation_id, **update_data})
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"Erro ao atualizar consulta {consultation_id}: {str(e)}")
    finally:
        db.close()


def download_audio_from_supabase(file_path: str) -> str:
    """Baixa o áudio do Supabase Storage e salva temporariamente"""
    try:
        # Baixar arquivo do Supabase
        response = supabase.storage.from_(settings.SUPABASE_BUCKET).download(file_path)

        # Criar arquivo temporário
        suffix = os.path.splitext(file_path)[1] or ".wav"
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        temp_file.write(response)
        temp_file.close()

        return temp_file.name
    except Exception as e:
        raise Exception(f"Erro ao baixar áudio do Supabase: {str(e)}")


def transcribe_audio(audio_path: str) -> str:
    """Transcreve o áudio usando OpenAI Whisper"""
    try:
        with open(audio_path, "rb") as audio_file:
            transcript = openai_client.audio.transcriptions.create(
                model=settings.WHISPER_MODEL,
                file=audio_file,
                language="pt"
            )
        return transcript.text
    except Exception as e:
        raise Exception(f"Erro ao transcrever áudio: {str(e)}")


def generate_summary(transcription: str) -> Dict[str, Any]:
    """Gera resumo estruturado usando GPT-4"""
    try:
        prompt = f"""Analise a seguinte transcrição de uma consulta médica e gere um resumo estruturado em JSON com os seguintes campos:

1. chief_complaint: Queixa principal do paciente
2. history_present_illness: História da doença atual
3. physical_examination: Exame físico realizado
4. assessment: Avaliação e diagnóstico
5. plan: Plano de tratamento
6. prescriptions: Lista de medicamentos prescritos (array de objetos com name, dosage, frequency)
7. cid10_suggestions: Sugestões de códigos CID-10 relevantes (array de objetos com code, description)

Transcrição:
{transcription}

Retorne APENAS o JSON, sem explicações adicionais."""

        response = openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Você é um assistente médico especializado em analisar consultas e gerar resumos estruturados."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        import json
        summary = json.loads(response.choices[0].message.content)
        return summary
    except Exception as e:
        raise Exception(f"Erro ao gerar resumo: {str(e)}")


@celery_app.task(bind=True, base=ConsultationTask, max_retries=3)
def process_consultation(self, consultation_id: str, audio_file_path: str):
    """
    Processa uma consulta médica: transcreve áudio e gera resumo

    Args:
        consultation_id: ID da consulta no banco de dados
        audio_file_path: Caminho do arquivo de áudio no Supabase Storage
    """
    temp_audio_path = None

    try:
        print(f"[{consultation_id}] Iniciando processamento da consulta")

        # ===== FASE 1: TRANSCRIÇÃO =====
        update_consultation_status(consultation_id, "transcribing")
        print(f"[{consultation_id}] Status: transcribing")

        # Baixar áudio do Supabase
        print(f"[{consultation_id}] Baixando áudio do Supabase: {audio_file_path}")
        temp_audio_path = download_audio_from_supabase(audio_file_path)
        print(f"[{consultation_id}] Áudio baixado: {temp_audio_path}")

        # Transcrever áudio
        print(f"[{consultation_id}] Transcrevendo áudio...")
        transcription = transcribe_audio(temp_audio_path)
        print(f"[{consultation_id}] Transcrição concluída: {len(transcription)} caracteres")

        # ===== FASE 2: GERAÇÃO DE RESUMO =====
        update_consultation_status(consultation_id, "summarizing", transcription=transcription)
        print(f"[{consultation_id}] Status: summarizing")

        # Gerar resumo estruturado
        print(f"[{consultation_id}] Gerando resumo estruturado...")
        summary = generate_summary(transcription)
        print(f"[{consultation_id}] Resumo gerado com sucesso")

        # ===== FASE 3: CONCLUSÃO =====
        update_consultation_status(
            consultation_id,
            "completed",
            transcription=transcription,
            summary=summary
        )
        print(f"[{consultation_id}] Status: completed")

        return {
            "consultation_id": consultation_id,
            "status": "completed",
            "transcription_length": len(transcription),
            "summary_keys": list(summary.keys())
        }

    except Exception as e:
        print(f"[{consultation_id}] ERRO: {str(e)}")
        update_consultation_status(consultation_id, "failed", error_message=str(e))
        # Retry com backoff exponencial
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

    finally:
        # Limpar arquivo temporário
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.unlink(temp_audio_path)
                print(f"[{consultation_id}] Arquivo temporário removido")
            except Exception as e:
                print(f"[{consultation_id}] Erro ao remover arquivo temporário: {str(e)}")

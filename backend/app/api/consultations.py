"""
API endpoints para Consultas Médicas
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from supabase import create_client, Client
import uuid

from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationResponse,
    ConsultationList,
    ConsultationStatus
)
from app.models.consultation import Consultation
from app.workers.tasks import process_consultation
from app.core.config import settings
from app.api.deps import get_db

router = APIRouter(prefix="/consultations", tags=["consultations"])

# Cliente Supabase
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


@router.post("/upload", response_model=ConsultationResponse, status_code=201)
async def upload_consultation(
    patient_id: str = Form(...),
    doctor_id: str = Form(...),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload de áudio de consulta e enfileiramento para processamento

    Fluxo:
    1. Upload do áudio para Supabase Storage
    2. Criação do registro no banco (status: uploading)
    3. Atualização do status para queued
    4. Enfileiramento da task Celery
    5. Retorno da consulta criada
    """
    try:
        # Validar tipo de arquivo
        allowed_types = ["audio/wav", "audio/mp3", "audio/mpeg", "audio/m4a", "audio/x-m4a"]
        if audio_file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de arquivo não permitido: {audio_file.content_type}"
            )

        # Gerar nome único para o arquivo
        file_extension = audio_file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"{doctor_id}/{patient_id}/{file_name}"

        # 1. Criar registro no banco (status: uploading)
        consultation = Consultation(
            patient_id=patient_id,
            doctor_id=doctor_id,
            audio_file_path=file_path,
            status=ConsultationStatus.UPLOADING
        )
        db.add(consultation)
        db.commit()
        db.refresh(consultation)

        # 2. Upload para Supabase Storage
        try:
            audio_bytes = await audio_file.read()
            supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
                file_path,
                audio_bytes,
                file_options={"content-type": audio_file.content_type}
            )
        except Exception as e:
            # Reverter criação se upload falhar
            db.delete(consultation)
            db.commit()
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao fazer upload do áudio: {str(e)}"
            )

        # 3. Atualizar status para queued
        consultation.status = ConsultationStatus.QUEUED
        db.commit()
        db.refresh(consultation)

        # 4. Enfileirar task de processamento
        task = process_consultation.delay(consultation.id, file_path)
        consultation.task_id = task.id
        db.commit()
        db.refresh(consultation)

        return consultation

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/{consultation_id}", response_model=ConsultationResponse)
def get_consultation(consultation_id: str, db: Session = Depends(get_db)):
    """Obter detalhes de uma consulta específica"""
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")

    return consultation


@router.get("/", response_model=ConsultationList)
def list_consultations(
    patient_id: Optional[str] = None,
    doctor_id: Optional[str] = None,
    status: Optional[ConsultationStatus] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """
    Listar consultas com filtros opcionais

    Filtros:
    - patient_id: Filtrar por paciente
    - doctor_id: Filtrar por médico
    - status: Filtrar por status
    - page: Número da página (default: 1)
    - page_size: Itens por página (default: 20)
    """
    query = db.query(Consultation)

    # Aplicar filtros
    if patient_id:
        query = query.filter(Consultation.patient_id == patient_id)
    if doctor_id:
        query = query.filter(Consultation.doctor_id == doctor_id)
    if status:
        query = query.filter(Consultation.status == status)

    # Contar total
    total = query.count()

    # Paginação
    consultations = (
        query.order_by(Consultation.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return ConsultationList(
        consultations=consultations,
        total=total,
        page=page,
        page_size=page_size
    )


@router.delete("/{consultation_id}", status_code=204)
def delete_consultation(consultation_id: str, db: Session = Depends(get_db)):
    """Deletar uma consulta (e seu áudio do Supabase)"""
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")

    try:
        # Deletar áudio do Supabase
        supabase.storage.from_(settings.SUPABASE_BUCKET).remove([consultation.audio_file_path])
    except Exception as e:
        # Log do erro mas não falha a operação
        print(f"Erro ao deletar áudio do Supabase: {str(e)}")

    # Deletar do banco
    db.delete(consultation)
    db.commit()

    return None


@router.post("/{consultation_id}/reprocess", response_model=ConsultationResponse)
def reprocess_consultation(consultation_id: str, db: Session = Depends(get_db)):
    """Reprocessar uma consulta (útil em caso de falha)"""
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")

    # Resetar status e enfileirar novamente
    consultation.status = ConsultationStatus.QUEUED
    consultation.error_message = None
    db.commit()

    # Enfileirar nova task
    task = process_consultation.delay(consultation.id, consultation.audio_file_path)
    consultation.task_id = task.id
    db.commit()
    db.refresh(consultation)

    return consultation

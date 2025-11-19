"""
Consultations API endpoints
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File, Form
from app.core.security import get_current_user, User
from app.core.database import get_supabase
from app.workers.tasks import run_async_task
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/consultations", tags=["consultations"])


@router.post("/process/{consultation_id}")
async def trigger_processing(
    consultation_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Dispara processamento de uma consulta
    (chamado automaticamente após upload de áudio)
    """
    try:
        # Verificar se a consulta existe e pertence ao usuário
        supabase = get_supabase()
        result = await supabase.table("consultations").select("id, user_id").eq(
            "id", consultation_id
        ).eq("user_id", current_user.id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Consulta não encontrada")

        # Adicionar tarefa em background
        background_tasks.add_task(run_async_task, consultation_id)

        logger.info(f"Processamento iniciado para consulta {consultation_id}")

        return {
            "message": "Processamento iniciado",
            "consultation_id": consultation_id,
            "status": "queued"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao iniciar processamento: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{consultation_id}/status")
async def get_consultation_status(
    consultation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retorna status atual do processamento
    """
    try:
        supabase = get_supabase()

        result = await supabase.table("consultations").select(
            "id, status, error_message, transcription, summary, icd_suggestions, created_at, completed_at"
        ).eq("id", consultation_id).eq("user_id", current_user.id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Consulta não encontrada")

        return result.data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{consultation_id}")
async def get_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retorna dados completos de uma consulta
    """
    try:
        supabase = get_supabase()

        result = await supabase.table("consultations").select(
            "*, patients(*)"
        ).eq("id", consultation_id).eq("user_id", current_user.id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Consulta não encontrada")

        return result.data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar consulta: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_consultations(
    patient_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """
    Lista consultas do usuário com filtros opcionais
    """
    try:
        supabase = get_supabase()

        query = supabase.table("consultations").select(
            "*, patients(name, date_of_birth)"
        ).eq("user_id", current_user.id)

        if patient_id:
            query = query.eq("patient_id", patient_id)

        if status:
            query = query.eq("status", status)

        result = await query.order(
            "created_at", desc=True
        ).range(offset, offset + limit - 1).execute()

        return {
            "consultations": result.data,
            "count": len(result.data),
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        logger.error(f"Erro ao listar consultas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{consultation_id}/icd-codes")
async def update_icd_codes(
    consultation_id: str,
    icd_codes: list,
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza códigos CID-10 confirmados pelo médico
    """
    try:
        supabase = get_supabase()

        # Verificar se a consulta existe e pertence ao usuário
        check = await supabase.table("consultations").select("id").eq(
            "id", consultation_id
        ).eq("user_id", current_user.id).single().execute()

        if not check.data:
            raise HTTPException(status_code=404, detail="Consulta não encontrada")

        # Atualizar códigos CID
        result = await supabase.table("consultations").update({
            "icd_codes": icd_codes
        }).eq("id", consultation_id).execute()

        logger.info(f"Códigos CID atualizados para consulta {consultation_id}")

        return {
            "message": "Códigos CID atualizados com sucesso",
            "icd_codes": icd_codes
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar códigos CID: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import logging

from app.models.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentListResponse,
    DocumentType
)
from app.services.document_service import DocumentService
from app.middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/generate", response_model=DocumentResponse, status_code=201)
async def generate_document(
    document_request: DocumentCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a medical document (certificate, prescription, or attendance declaration)

    Args:
        document_request: Document creation request with consultation_id, type, and additional data
        current_user: Authenticated user from JWT token

    Returns:
        Generated document with download URL
    """
    try:
        service = DocumentService()

        document = await service.generate_document(
            consultation_id=document_request.consultation_id,
            document_type=document_request.document_type,
            additional_data=document_request.additional_data,
            user_id=current_user['id']
        )

        return document

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate document")


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    consultation_id: Optional[str] = Query(None, description="Filter by consultation ID"),
    current_user: dict = Depends(get_current_user)
):
    """
    List all documents, optionally filtered by consultation

    Args:
        consultation_id: Optional consultation ID to filter documents
        current_user: Authenticated user

    Returns:
        List of documents
    """
    try:
        service = DocumentService()

        if consultation_id:
            documents = await service.get_documents_by_consultation(consultation_id)
        else:
            # TODO: Implement list all documents with pagination
            documents = []

        return documents

    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list documents")


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get document by ID

    Args:
        document_id: Document UUID
        current_user: Authenticated user

    Returns:
        Document details with download URL
    """
    try:
        service = DocumentService()
        supabase = service.supabase

        # Fetch document
        response = supabase.table('documents') \
            .select('*') \
            .eq('id', document_id) \
            .single() \
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Document not found")

        # Get public URL
        file_url = supabase.storage \
            .from_(service.bucket_name) \
            .get_public_url(response.data['file_path'])

        return DocumentResponse(
            **response.data,
            file_url=file_url
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch document")


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a document

    Args:
        document_id: Document UUID to delete
        current_user: Authenticated user

    Returns:
        204 No Content on success
    """
    try:
        service = DocumentService()
        deleted = await service.delete_document(document_id)

        if not deleted:
            raise HTTPException(status_code=404, detail="Document not found")

        return None

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete document")


@router.get("/consultation/{consultation_id}", response_model=List[DocumentResponse])
async def get_consultation_documents(
    consultation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all documents for a specific consultation

    Args:
        consultation_id: Consultation UUID
        current_user: Authenticated user

    Returns:
        List of documents for the consultation
    """
    try:
        service = DocumentService()
        documents = await service.get_documents_by_consultation(consultation_id)

        return documents

    except Exception as e:
        logger.error(f"Error fetching consultation documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch consultation documents")

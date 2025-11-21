from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import logging
from io import BytesIO

from app.services.document_generator import DocumentGenerator
from app.utils.supabase_client import SupabaseClient
from app.models.document import DocumentType, DocumentStatus, DocumentResponse
from app.config import settings

logger = logging.getLogger(__name__)


class DocumentService:
    """Service for managing document generation and storage"""

    def __init__(self):
        self.generator = DocumentGenerator()
        self.supabase = SupabaseClient.get_client()
        self.bucket_name = settings.SUPABASE_BUCKET_NAME

    async def generate_document(
        self,
        consultation_id: str,
        document_type: DocumentType,
        additional_data: Dict[str, Any],
        user_id: str
    ) -> DocumentResponse:
        """
        Generate a medical document and store it

        Args:
            consultation_id: UUID of the consultation
            document_type: Type of document to generate
            additional_data: Type-specific data
            user_id: ID of the user generating the document

        Returns:
            DocumentResponse with file URL and metadata
        """
        try:
            # 1. Fetch consultation data
            consultation_data = await self._fetch_consultation(consultation_id)
            if not consultation_data:
                raise ValueError(f"Consultation {consultation_id} not found")

            # 2. Fetch patient data
            patient_data = await self._fetch_patient(consultation_data['patient_id'])
            if not patient_data:
                raise ValueError(f"Patient not found")

            # 3. Fetch doctor data
            doctor_data = await self._fetch_doctor(consultation_data['doctor_id'])
            if not doctor_data:
                raise ValueError(f"Doctor not found")

            # 4. Prepare data for document generation
            patient_info = {
                'full_name': f"{patient_data.get('first_name', '')} {patient_data.get('last_name', '')}".strip(),
                'cpf': patient_data.get('cpf', ''),
                'date_of_birth': patient_data.get('date_of_birth'),
                'age': self._calculate_age(patient_data.get('date_of_birth'))
            }

            doctor_info = {
                'full_name': doctor_data.get('full_name', ''),
                'crm': doctor_data.get('crm', 'CRM não informado'),
                'specialty': doctor_data.get('specialty', 'Medicina Geral'),
                'address': doctor_data.get('address'),
                'phone': doctor_data.get('phone')
            }

            document_data = {
                'consultation_date': consultation_data.get('consultation_date', datetime.now()),
                **additional_data
            }

            # 5. Generate PDF based on document type
            pdf_buffer = self._generate_pdf_by_type(
                document_type,
                patient_info,
                doctor_info,
                document_data
            )

            # 6. Upload to Supabase Storage
            file_path = self._generate_file_path(
                user_id,
                consultation_id,
                document_type
            )

            file_url = await self._upload_to_storage(pdf_buffer, file_path)

            # 7. Save document record to database
            document_record = await self._save_document_record(
                consultation_id=consultation_id,
                patient_id=consultation_data['patient_id'],
                document_type=document_type,
                file_path=file_path,
                file_url=file_url,
                file_size=pdf_buffer.getbuffer().nbytes,
                generated_by=user_id
            )

            return document_record

        except Exception as e:
            logger.error(f"Error generating document: {str(e)}")
            raise

    def _generate_pdf_by_type(
        self,
        document_type: DocumentType,
        patient_data: Dict,
        doctor_data: Dict,
        document_data: Dict
    ) -> BytesIO:
        """Generate PDF based on document type"""
        if document_type == DocumentType.MEDICAL_CERTIFICATE:
            return self.generator.generate_medical_certificate(
                patient_data, doctor_data, document_data
            )
        elif document_type == DocumentType.PRESCRIPTION:
            return self.generator.generate_prescription(
                patient_data, doctor_data, document_data
            )
        elif document_type == DocumentType.ATTENDANCE_DECLARATION:
            return self.generator.generate_attendance_declaration(
                patient_data, doctor_data, document_data
            )
        else:
            raise ValueError(f"Unsupported document type: {document_type}")

    async def _fetch_consultation(self, consultation_id: str) -> Optional[Dict]:
        """Fetch consultation from database"""
        try:
            response = self.supabase.table('consultations') \
                .select('*') \
                .eq('id', consultation_id) \
                .single() \
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching consultation: {str(e)}")
            return None

    async def _fetch_patient(self, patient_id: str) -> Optional[Dict]:
        """Fetch patient from database"""
        try:
            response = self.supabase.table('patients') \
                .select('*') \
                .eq('id', patient_id) \
                .single() \
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching patient: {str(e)}")
            return None

    async def _fetch_doctor(self, doctor_id: str) -> Optional[Dict]:
        """Fetch doctor from database"""
        try:
            response = self.supabase.table('users') \
                .select('*') \
                .eq('id', doctor_id) \
                .single() \
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching doctor: {str(e)}")
            return None

    def _generate_file_path(
        self,
        user_id: str,
        consultation_id: str,
        document_type: DocumentType
    ) -> str:
        """Generate file path for storage"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{document_type.value}_{timestamp}.pdf"
        return f"{user_id}/{consultation_id}/{filename}"

    async def _upload_to_storage(self, pdf_buffer: BytesIO, file_path: str) -> str:
        """Upload PDF to Supabase Storage"""
        try:
            pdf_bytes = pdf_buffer.getvalue()

            # Upload to Supabase Storage
            response = self.supabase.storage \
                .from_(self.bucket_name) \
                .upload(
                    file_path,
                    pdf_bytes,
                    file_options={"content-type": "application/pdf"}
                )

            # Get public URL
            file_url = self.supabase.storage \
                .from_(self.bucket_name) \
                .get_public_url(file_path)

            return file_url

        except Exception as e:
            logger.error(f"Error uploading to storage: {str(e)}")
            raise

    async def _save_document_record(
        self,
        consultation_id: str,
        patient_id: str,
        document_type: DocumentType,
        file_path: str,
        file_url: str,
        file_size: int,
        generated_by: str
    ) -> DocumentResponse:
        """Save document record to database"""
        try:
            document_id = str(uuid.uuid4())
            now = datetime.now().isoformat()

            # Map document type to title
            title_map = {
                DocumentType.MEDICAL_CERTIFICATE: "Atestado Médico",
                DocumentType.PRESCRIPTION: "Receita Médica",
                DocumentType.ATTENDANCE_DECLARATION: "Declaração de Comparecimento"
            }

            document_data = {
                'id': document_id,
                'consultation_id': consultation_id,
                'patient_id': patient_id,
                'document_type': document_type.value,
                'document_title': title_map.get(document_type, "Documento"),
                'file_path': file_path,
                'file_size': file_size,
                'mime_type': 'application/pdf',
                'generated_by': generated_by,
                'status': DocumentStatus.GENERATED.value,
                'created_at': now,
                'updated_at': now
            }

            response = self.supabase.table('documents') \
                .insert(document_data) \
                .execute()

            return DocumentResponse(
                **response.data[0],
                file_url=file_url
            )

        except Exception as e:
            logger.error(f"Error saving document record: {str(e)}")
            raise

    async def get_documents_by_consultation(
        self,
        consultation_id: str
    ) -> List[DocumentResponse]:
        """Get all documents for a consultation"""
        try:
            response = self.supabase.table('documents') \
                .select('*') \
                .eq('consultation_id', consultation_id) \
                .order('created_at', desc=True) \
                .execute()

            documents = []
            for doc in response.data:
                # Get public URL
                file_url = self.supabase.storage \
                    .from_(self.bucket_name) \
                    .get_public_url(doc['file_path'])

                documents.append(DocumentResponse(
                    **doc,
                    file_url=file_url
                ))

            return documents

        except Exception as e:
            logger.error(f"Error fetching documents: {str(e)}")
            return []

    async def delete_document(self, document_id: str) -> bool:
        """Delete document from storage and database"""
        try:
            # Get document record
            response = self.supabase.table('documents') \
                .select('*') \
                .eq('id', document_id) \
                .single() \
                .execute()

            if not response.data:
                return False

            file_path = response.data['file_path']

            # Delete from storage
            self.supabase.storage \
                .from_(self.bucket_name) \
                .remove([file_path])

            # Delete from database
            self.supabase.table('documents') \
                .delete() \
                .eq('id', document_id) \
                .execute()

            return True

        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            return False

    def _calculate_age(self, date_of_birth: Any) -> int:
        """Calculate age from date of birth"""
        if not date_of_birth:
            return 0

        if isinstance(date_of_birth, str):
            from dateutil import parser
            dob = parser.parse(date_of_birth).date()
        else:
            dob = date_of_birth

        today = datetime.now().date()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

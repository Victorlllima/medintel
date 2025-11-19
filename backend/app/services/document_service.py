"""
Document Service - Geração de Documentos Médicos em PDF
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, Frame
from io import BytesIO
import datetime
from typing import Optional, List, Dict
import logging

logger = logging.getLogger(__name__)

class DocumentService:

    def __init__(self):
        self.page_width, self.page_height = A4
        self.margin = 2.5 * cm

    def _add_header(self, c: canvas.Canvas, doctor_name: str, doctor_crm: str):
        """Adiciona cabeçalho padrão"""
        c.setFont("Helvetica-Bold", 14)
        c.drawString(self.margin, self.page_height - self.margin, doctor_name)
        c.setFont("Helvetica", 10)
        c.drawString(self.margin, self.page_height - self.margin - 0.5*cm, f"CRM: {doctor_crm}")

        # Linha separadora
        y = self.page_height - self.margin - 1*cm
        c.line(self.margin, y, self.page_width - self.margin, y)

    def _add_footer(self, c: canvas.Canvas, doctor_name: str, doctor_crm: str):
        """Adiciona rodapé com assinatura"""
        y = self.margin + 3*cm

        # Linha para assinatura
        line_start = self.page_width / 2 - 4*cm
        line_end = self.page_width / 2 + 4*cm
        c.line(line_start, y, line_end, y)

        # Dados do médico
        c.setFont("Helvetica", 10)
        text_y = y - 0.5*cm
        c.drawCentredString(self.page_width / 2, text_y, doctor_name)
        c.drawCentredString(self.page_width / 2, text_y - 0.4*cm, f"CRM: {doctor_crm}")

        # Data
        c.setFont("Helvetica", 9)
        date_str = datetime.date.today().strftime("%d/%m/%Y")
        c.drawCentredString(self.page_width / 2, text_y - 1*cm, f"Data: {date_str}")

    def generate_medical_certificate(
        self,
        patient_name: str,
        doctor_name: str,
        doctor_crm: str,
        icd_code: str,
        icd_description: str,
        days_off: int,
        start_date: Optional[datetime.date] = None
    ) -> BytesIO:
        """
        Gera atestado médico em PDF

        Args:
            patient_name: Nome do paciente
            doctor_name: Nome do médico
            doctor_crm: CRM do médico
            icd_code: Código CID-10
            icd_description: Descrição do CID
            days_off: Dias de afastamento
            start_date: Data de início (default: hoje)
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)

        # Header
        self._add_header(c, doctor_name, doctor_crm)

        # Título
        y = self.page_height - self.margin - 2*cm
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(self.page_width / 2, y, "ATESTADO MÉDICO")

        # Corpo do texto
        y -= 2*cm
        c.setFont("Helvetica", 12)

        start_date = start_date or datetime.date.today()

        text_lines = [
            f"Atesto, para os devidos fins, que o(a) paciente {patient_name}",
            f"esteve sob meus cuidados médicos e deverá permanecer afastado(a)",
            f"de suas atividades por {days_off} {'dia' if days_off == 1 else 'dias'}, a partir de {start_date.strftime('%d/%m/%Y')}.",
            "",
            f"CID-10: {icd_code} - {icd_description}"
        ]

        for line in text_lines:
            c.drawString(self.margin, y, line)
            y -= 0.6*cm

        # Footer
        self._add_footer(c, doctor_name, doctor_crm)

        c.showPage()
        c.save()

        buffer.seek(0)
        logger.info(f"Atestado médico gerado para: {patient_name}")
        return buffer

    def generate_prescription(
        self,
        patient_name: str,
        patient_age: int,
        doctor_name: str,
        doctor_crm: str,
        medications: List[Dict[str, str]]
    ) -> BytesIO:
        """
        Gera receita médica em PDF

        Args:
            medications: Lista de dicionários com:
                - name: Nome do medicamento
                - dosage: Dosagem
                - frequency: Frequência
                - duration: Duração do tratamento

        Example:
            medications = [
                {
                    "name": "Paracetamol 500mg",
                    "dosage": "1 comprimido",
                    "frequency": "a cada 8 horas",
                    "duration": "5 dias"
                }
            ]
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)

        # Header
        self._add_header(c, doctor_name, doctor_crm)

        # Título
        y = self.page_height - self.margin - 2*cm
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(self.page_width / 2, y, "RECEITA MÉDICA")

        # Dados do paciente
        y -= 1.5*cm
        c.setFont("Helvetica-Bold", 11)
        c.drawString(self.margin, y, "PACIENTE:")

        y -= 0.5*cm
        c.setFont("Helvetica", 11)
        c.drawString(self.margin, y, f"Nome: {patient_name}")

        y -= 0.5*cm
        c.drawString(self.margin, y, f"Idade: {patient_age} anos")

        # Medicações
        y -= 1.5*cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(self.margin, y, "MEDICAÇÕES PRESCRITAS:")

        y -= 0.8*cm

        for i, med in enumerate(medications, 1):
            # Nome do medicamento
            c.setFont("Helvetica-Bold", 11)
            c.drawString(self.margin, y, f"{i}. {med['name']}")
            y -= 0.5*cm

            # Instruções
            c.setFont("Helvetica", 10)
            c.drawString(self.margin + 0.5*cm, y, f"   {med['dosage']} - {med['frequency']}")
            y -= 0.4*cm
            c.drawString(self.margin + 0.5*cm, y, f"   Duração: {med['duration']}")
            y -= 0.8*cm

            # Evitar que saia da página
            if y < self.margin + 5*cm:
                c.showPage()
                y = self.page_height - self.margin - 2*cm

        # Footer
        self._add_footer(c, doctor_name, doctor_crm)

        c.showPage()
        c.save()

        buffer.seek(0)
        logger.info(f"Receita médica gerada para: {patient_name}")
        return buffer

    def generate_attendance_declaration(
        self,
        patient_name: str,
        doctor_name: str,
        doctor_crm: str,
        consultation_date: datetime.date,
        start_time: str,
        end_time: str
    ) -> BytesIO:
        """
        Gera declaração de comparecimento em PDF

        Args:
            start_time: Horário de início (ex: "14:00")
            end_time: Horário de fim (ex: "15:30")
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)

        # Header
        self._add_header(c, doctor_name, doctor_crm)

        # Título
        y = self.page_height - self.margin - 2*cm
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(self.page_width / 2, y, "DECLARAÇÃO DE COMPARECIMENTO")

        # Corpo do texto
        y -= 2.5*cm
        c.setFont("Helvetica", 12)

        text_lines = [
            f"Declaro, para os devidos fins, que o(a) Sr(a). {patient_name}",
            f"compareceu à consulta médica no dia {consultation_date.strftime('%d/%m/%Y')},",
            f"no horário de {start_time} às {end_time}.",
        ]

        for line in text_lines:
            c.drawString(self.margin, y, line)
            y -= 0.6*cm

        # Footer
        self._add_footer(c, doctor_name, doctor_crm)

        c.showPage()
        c.save()

        buffer.seek(0)
        logger.info(f"Declaração de comparecimento gerada para: {patient_name}")
        return buffer


# Singleton
_document_service: Optional[DocumentService] = None

def get_document_service() -> DocumentService:
    """Get or create document service instance"""
    global _document_service
    if _document_service is None:
        _document_service = DocumentService()
    return _document_service

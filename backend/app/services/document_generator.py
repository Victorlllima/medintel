from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)


class DocumentGenerator:
    """
    Service for generating medical documents in PDF format.
    Supports: Medical Certificates, Prescriptions, and Attendance Declarations.
    """

    def __init__(self):
        self.page_size = A4
        self.margin = 2 * cm
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles for documents"""
        # Header style
        self.styles.add(ParagraphStyle(
            name='CustomHeader',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1a5490'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        # Subheader style
        self.styles.add(ParagraphStyle(
            name='CustomSubHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=8,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        # Body style
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=16,
            alignment=TA_JUSTIFY,
            fontName='Helvetica'
        ))

        # Signature style
        self.styles.add(ParagraphStyle(
            name='Signature',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))

    def generate_medical_certificate(
        self,
        patient_data: Dict[str, Any],
        doctor_data: Dict[str, Any],
        certificate_data: Dict[str, Any]
    ) -> BytesIO:
        """
        Generate Medical Certificate (Atestado Médico)

        Args:
            patient_data: {full_name, cpf}
            doctor_data: {full_name, crm, specialty}
            certificate_data: {consultation_date, days_off, cid10 (optional), notes (optional)}
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.page_size,
            rightMargin=self.margin,
            leftMargin=self.margin,
            topMargin=self.margin,
            bottomMargin=self.margin
        )

        elements = []

        # Header
        elements.append(Paragraph("ATESTADO MÉDICO", self.styles['CustomHeader']))
        elements.append(Spacer(1, 0.5 * cm))

        # Document content
        consultation_date = datetime.fromisoformat(certificate_data['consultation_date'].replace('Z', '+00:00')) if isinstance(certificate_data['consultation_date'], str) else certificate_data['consultation_date']
        days_off = certificate_data.get('days_off', 1)

        # Main text
        text = f"""
        Atesto para os devidos fins que o(a) Sr(a). <b>{patient_data['full_name']}</b>,
        portador(a) do CPF <b>{self._format_cpf(patient_data['cpf'])}</b>,
        foi atendido(a) por mim em consulta médica no dia <b>{consultation_date.strftime('%d/%m/%Y')}</b>,
        necessitando de <b>{days_off} dia(s)</b> de afastamento de suas atividades
        para tratamento de saúde.
        """

        elements.append(Paragraph(text, self.styles['CustomBody']))
        elements.append(Spacer(1, 0.3 * cm))

        # CID-10 if provided
        if certificate_data.get('cid10'):
            cid_text = f"<b>CID-10:</b> {certificate_data['cid10']}"
            elements.append(Paragraph(cid_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.3 * cm))

        # Period
        start_date = consultation_date
        end_date = start_date + timedelta(days=days_off - 1)
        period_text = f"<b>Período:</b> {start_date.strftime('%d/%m/%Y')} a {end_date.strftime('%d/%m/%Y')}"
        elements.append(Paragraph(period_text, self.styles['CustomBody']))
        elements.append(Spacer(1, 0.5 * cm))

        # Additional notes
        if certificate_data.get('notes'):
            elements.append(Paragraph(f"<b>Observações:</b> {certificate_data['notes']}", self.styles['CustomBody']))
            elements.append(Spacer(1, 0.5 * cm))

        # Date and location
        elements.append(Spacer(1, 1 * cm))
        date_text = f"{consultation_date.strftime('%d de %B de %Y')}"
        elements.append(Paragraph(date_text, self.styles['Signature']))
        elements.append(Spacer(1, 1.5 * cm))

        # Signature line
        elements.append(Paragraph("_" * 50, self.styles['Signature']))
        elements.append(Paragraph(
            f"<b>Dr(a). {doctor_data['full_name']}</b><br/>CRM: {doctor_data['crm']}<br/>{doctor_data.get('specialty', '')}",
            self.styles['Signature']
        ))

        # Footer
        elements.append(Spacer(1, 1 * cm))
        footer_text = f"<i>Documento gerado eletronicamente em {datetime.now().strftime('%d/%m/%Y às %H:%M')}</i>"
        elements.append(Paragraph(footer_text, ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_prescription(
        self,
        patient_data: Dict[str, Any],
        doctor_data: Dict[str, Any],
        prescription_data: Dict[str, Any]
    ) -> BytesIO:
        """
        Generate Medical Prescription (Receita Médica)

        Args:
            patient_data: {full_name, age, date_of_birth}
            doctor_data: {full_name, crm, specialty, address, phone}
            prescription_data: {consultation_date, medications: [{name, dosage, instructions, duration}], validity_days}
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.page_size,
            rightMargin=self.margin,
            leftMargin=self.margin,
            topMargin=self.margin,
            bottomMargin=self.margin
        )

        elements = []

        # Header with doctor info
        elements.append(Paragraph(f"<b>Dr(a). {doctor_data['full_name']}</b>", self.styles['CustomSubHeader']))
        elements.append(Paragraph(f"CRM: {doctor_data['crm']} | {doctor_data.get('specialty', '')}", self.styles['Normal']))

        if doctor_data.get('address'):
            elements.append(Paragraph(doctor_data['address'], ParagraphStyle(
                name='SmallText',
                parent=self.styles['Normal'],
                fontSize=9,
                alignment=TA_CENTER
            )))

        if doctor_data.get('phone'):
            elements.append(Paragraph(f"Tel: {doctor_data['phone']}", ParagraphStyle(
                name='SmallText',
                parent=self.styles['Normal'],
                fontSize=9,
                alignment=TA_CENTER
            )))

        elements.append(Spacer(1, 0.5 * cm))

        # Divider
        elements.append(Paragraph("_" * 80, self.styles['Normal']))
        elements.append(Spacer(1, 0.5 * cm))

        # Title
        elements.append(Paragraph("RECEITA MÉDICA", self.styles['CustomHeader']))
        elements.append(Spacer(1, 0.5 * cm))

        # Patient info
        consultation_date = datetime.fromisoformat(prescription_data['consultation_date'].replace('Z', '+00:00')) if isinstance(prescription_data['consultation_date'], str) else prescription_data['consultation_date']

        patient_info = f"""
        <b>Paciente:</b> {patient_data['full_name']}<br/>
        <b>Data:</b> {consultation_date.strftime('%d/%m/%Y')}
        """
        elements.append(Paragraph(patient_info, self.styles['CustomBody']))
        elements.append(Spacer(1, 0.5 * cm))

        # Medications
        elements.append(Paragraph("<b>PRESCRIÇÃO:</b>", self.styles['CustomBody']))
        elements.append(Spacer(1, 0.3 * cm))

        medications = prescription_data.get('medications', [])
        for idx, med in enumerate(medications, 1):
            med_text = f"""
            <b>{idx}. {med['name']}</b><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;Dosagem: {med.get('dosage', 'Conforme orientação médica')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;Posologia: {med.get('instructions', 'Conforme orientação médica')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;Duração: {med.get('duration', 'Conforme necessário')}
            """
            elements.append(Paragraph(med_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.3 * cm))

        # Additional instructions
        if prescription_data.get('instructions'):
            elements.append(Spacer(1, 0.3 * cm))
            elements.append(Paragraph(f"<b>Orientações gerais:</b><br/>{prescription_data['instructions']}", self.styles['CustomBody']))

        # Validity
        elements.append(Spacer(1, 0.5 * cm))
        validity_days = prescription_data.get('validity_days', 30)
        validity_date = consultation_date + timedelta(days=validity_days)
        validity_text = f"<i>Receita válida até: {validity_date.strftime('%d/%m/%Y')}</i>"
        elements.append(Paragraph(validity_text, self.styles['CustomBody']))

        # Signature
        elements.append(Spacer(1, 1.5 * cm))
        elements.append(Paragraph("_" * 50, self.styles['Signature']))
        elements.append(Paragraph(
            f"<b>Dr(a). {doctor_data['full_name']}</b><br/>CRM: {doctor_data['crm']}",
            self.styles['Signature']
        ))

        # Footer
        elements.append(Spacer(1, 1 * cm))
        footer_text = f"<i>Documento gerado eletronicamente em {datetime.now().strftime('%d/%m/%Y às %H:%M')}</i>"
        elements.append(Paragraph(footer_text, ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_attendance_declaration(
        self,
        patient_data: Dict[str, Any],
        doctor_data: Dict[str, Any],
        attendance_data: Dict[str, Any]
    ) -> BytesIO:
        """
        Generate Attendance Declaration (Declaração de Comparecimento)

        Args:
            patient_data: {full_name, cpf}
            doctor_data: {full_name, crm, specialty}
            attendance_data: {consultation_date, start_time, end_time, duration_minutes}
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.page_size,
            rightMargin=self.margin,
            leftMargin=self.margin,
            topMargin=self.margin,
            bottomMargin=self.margin
        )

        elements = []

        # Header
        elements.append(Paragraph("DECLARAÇÃO DE COMPARECIMENTO", self.styles['CustomHeader']))
        elements.append(Spacer(1, 0.5 * cm))

        # Content
        consultation_date = datetime.fromisoformat(attendance_data['consultation_date'].replace('Z', '+00:00')) if isinstance(attendance_data['consultation_date'], str) else attendance_data['consultation_date']

        start_time = attendance_data.get('start_time', consultation_date.strftime('%H:%M'))
        end_time = attendance_data.get('end_time')
        duration_minutes = attendance_data.get('duration_minutes', 30)

        if not end_time and duration_minutes:
            end_datetime = consultation_date + timedelta(minutes=duration_minutes)
            end_time = end_datetime.strftime('%H:%M')

        text = f"""
        Declaro para os devidos fins que o(a) Sr(a). <b>{patient_data['full_name']}</b>,
        portador(a) do CPF <b>{self._format_cpf(patient_data['cpf'])}</b>,
        esteve presente em consulta médica no dia <b>{consultation_date.strftime('%d/%m/%Y')}</b>,
        no período das <b>{start_time}</b> às <b>{end_time}</b>,
        com duração aproximada de <b>{duration_minutes} minutos</b>.
        """

        elements.append(Paragraph(text, self.styles['CustomBody']))
        elements.append(Spacer(1, 1 * cm))

        # Additional purpose text
        purpose_text = "Esta declaração é válida para fins de justificativa de ausência."
        elements.append(Paragraph(purpose_text, self.styles['CustomBody']))

        # Date and location
        elements.append(Spacer(1, 1.5 * cm))
        date_text = f"{consultation_date.strftime('%d de %B de %Y')}"
        elements.append(Paragraph(date_text, self.styles['Signature']))
        elements.append(Spacer(1, 1.5 * cm))

        # Signature line
        elements.append(Paragraph("_" * 50, self.styles['Signature']))
        elements.append(Paragraph(
            f"<b>Dr(a). {doctor_data['full_name']}</b><br/>CRM: {doctor_data['crm']}<br/>{doctor_data.get('specialty', '')}",
            self.styles['Signature']
        ))

        # Footer
        elements.append(Spacer(1, 1 * cm))
        footer_text = f"<i>Documento gerado eletronicamente em {datetime.now().strftime('%d/%m/%Y às %H:%M')}</i>"
        elements.append(Paragraph(footer_text, ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def _format_cpf(self, cpf: str) -> str:
        """Format CPF to XXX.XXX.XXX-XX"""
        cpf = ''.join(filter(str.isdigit, cpf))
        if len(cpf) == 11:
            return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"
        return cpf

    def _format_phone(self, phone: str) -> str:
        """Format phone number"""
        phone = ''.join(filter(str.isdigit, phone))
        if len(phone) == 11:
            return f"({phone[:2]}) {phone[2:7]}-{phone[7:]}"
        elif len(phone) == 10:
            return f"({phone[:2]}) {phone[2:6]}-{phone[6:]}"
        return phone

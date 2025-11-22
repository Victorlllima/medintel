"""
Modelos SQLAlchemy para Consultas
"""
from sqlalchemy import Column, String, Text, Integer, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class Consultation(Base):
    """Modelo de Consulta Médica"""

    __tablename__ = "consultations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, nullable=False, index=True)
    doctor_id = Column(String, nullable=False, index=True)

    # Arquivo de áudio
    audio_file_path = Column(String, nullable=False)
    duration_seconds = Column(Integer, nullable=True)

    # Status do processamento
    status = Column(String, nullable=False, default="uploading", index=True)

    # Resultados do processamento
    transcription = Column(Text, nullable=True)
    summary = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)

    # Task ID do Celery
    task_id = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        return f"<Consultation {self.id} - {self.status}>"

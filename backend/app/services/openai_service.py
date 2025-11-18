"""
OpenAI integration service for transcription and summarization
"""
from openai import OpenAI
from typing import List, Dict
import json

from app.core.config import settings
from app.schemas.consultation import SummaryStructure, CIDSuggestion

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class OpenAIService:
    """Service for OpenAI API operations"""

    @staticmethod
    async def transcribe_audio(audio_file_path: str) -> dict:
        """
        Transcribe audio file using Whisper API

        Args:
            audio_file_path: Path to audio file

        Returns:
            Dict with transcription text and segments
        """
        with open(audio_file_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model=settings.WHISPER_MODEL,
                file=audio_file,
                response_format="verbose_json",
                language="pt"
            )

        return {
            "text": response.text,
            "segments": [
                {
                    "text": segment.get("text"),
                    "start": segment.get("start"),
                    "end": segment.get("end")
                }
                for segment in response.segments
            ] if hasattr(response, "segments") else []
        }

    @staticmethod
    async def generate_summary(transcription: str) -> SummaryStructure:
        """
        Generate structured clinical summary from transcription

        Args:
            transcription: Full transcription text

        Returns:
            SummaryStructure with clinical fields
        """
        prompt = f"""Você é um assistente médico especializado em documentação clínica.

Analise a seguinte transcrição de consulta médica e extraia as informações em formato estruturado:

TRANSCRIÇÃO:
{transcription}

Por favor, organize as informações nos seguintes campos:
1. Queixa Principal (chief_complaint): O motivo principal da consulta
2. História da Doença Atual (hda): Detalhes sobre a evolução dos sintomas
3. Exame Físico (physical_exam): Achados do exame físico, se mencionados
4. Avaliação/Hipótese Diagnóstica (assessment): Impressão diagnóstica do médico
5. Conduta/Plano (plan): Plano terapêutico e orientações

Responda APENAS com um JSON válido no formato:
{{
  "chief_complaint": "...",
  "hda": "...",
  "physical_exam": "...",
  "assessment": "...",
  "plan": "..."
}}

Se algum campo não estiver presente na transcrição, use null.
"""

        response = client.chat.completions.create(
            model=settings.GPT_MODEL,
            messages=[
                {"role": "system", "content": "Você é um assistente médico especializado. Responda apenas com JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        summary_dict = json.loads(response.choices[0].message.content)

        return SummaryStructure(**summary_dict)

    @staticmethod
    async def suggest_icd_codes(summary: SummaryStructure, transcription: str) -> List[CIDSuggestion]:
        """
        Suggest ICD-10 codes based on consultation summary

        Args:
            summary: Structured clinical summary
            transcription: Full transcription text

        Returns:
            List of top 3 ICD code suggestions with confidence
        """
        prompt = f"""Você é um assistente médico especializado em codificação CID-10.

Com base no resumo clínico abaixo, sugira os 3 códigos CID-10 mais apropriados:

QUEIXA PRINCIPAL: {summary.chief_complaint}
HISTÓRIA: {summary.hda}
AVALIAÇÃO: {summary.assessment}
CONDUTA: {summary.plan}

Considere apenas códigos CID-10 válidos da classificação brasileira.

Responda APENAS com um JSON válido no formato:
{{
  "suggestions": [
    {{"code": "A00.0", "description": "Descrição do CID", "confidence": 0.95}},
    {{"code": "B00.1", "description": "Descrição do CID", "confidence": 0.80}},
    {{"code": "C00.2", "description": "Descrição do CID", "confidence": 0.65}}
  ]
}}

A confiança (confidence) deve ser um valor entre 0 e 1.
Ordene por relevância (maior confiança primeiro).
"""

        response = client.chat.completions.create(
            model=settings.GPT_MODEL,
            messages=[
                {"role": "system", "content": "Você é um assistente médico especializado em CID-10. Responda apenas com JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)

        return [CIDSuggestion(**suggestion) for suggestion in result.get("suggestions", [])]

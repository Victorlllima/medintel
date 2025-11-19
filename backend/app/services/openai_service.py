"""
OpenAI Service - Transcrição e Resumos Clínicos
"""
from openai import AsyncOpenAI
import aiofiles
import os
import json
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)
        self.whisper_model = "whisper-1"
        self.gpt_model = "gpt-4"  # ou "gpt-4-turbo-preview"

    async def transcribe_audio(
        self,
        audio_file_path: str,
        language: str = "pt"
    ) -> Dict:
        """
        Transcreve áudio usando Whisper API

        Args:
            audio_file_path: Caminho para o arquivo de áudio
            language: Código do idioma (pt, en, es, etc)

        Returns:
            {
                "text": "transcrição completa...",
                "segments": [
                    {
                        "start": 0.0,
                        "end": 5.2,
                        "text": "primeiro segmento..."
                    }
                ],
                "language": "pt",
                "duration": 120.5
            }
        """
        try:
            logger.info(f"Iniciando transcrição: {audio_file_path}")

            async with aiofiles.open(audio_file_path, "rb") as audio_file:
                # Ler o conteúdo do arquivo
                audio_content = await audio_file.read()

                # Criar um objeto file-like para a API
                from io import BytesIO
                audio_buffer = BytesIO(audio_content)
                audio_buffer.name = os.path.basename(audio_file_path)

                # Fazer a transcrição
                transcript = await self.client.audio.transcriptions.create(
                    model=self.whisper_model,
                    file=audio_buffer,
                    language=language,
                    response_format="verbose_json",  # Retorna timestamps
                    temperature=0.0
                )

            logger.info(f"Transcrição concluída: {len(transcript.text)} caracteres")

            return {
                "text": transcript.text,
                "segments": transcript.segments if hasattr(transcript, 'segments') else [],
                "language": transcript.language if hasattr(transcript, 'language') else language,
                "duration": transcript.duration if hasattr(transcript, 'duration') else None
            }

        except Exception as e:
            logger.error(f"Erro na transcrição: {str(e)}")
            raise Exception(f"Falha na transcrição: {str(e)}")

    async def generate_clinical_summary(
        self,
        transcription: str,
        patient_name: str,
        patient_age: Optional[int] = None
    ) -> Dict:
        """
        Gera resumo estruturado da consulta usando GPT-4

        Returns:
            {
                "chief_complaint": "Queixa principal",
                "history_present_illness": "História da doença atual",
                "physical_exam": "Exame físico",
                "assessment": "Avaliação/Impressão diagnóstica",
                "plan": "Conduta/Plano terapêutico"
            }
        """
        try:
            logger.info(f"Gerando resumo clínico para: {patient_name}")

            system_prompt = """Você é um assistente médico especializado em resumir consultas médicas.

Analise a transcrição fornecida e extraia as informações no formato SOAP estruturado:

1. **Queixa Principal (Chief Complaint)**: Motivo da consulta em 1-2 frases
2. **História da Doença Atual (HDA)**: Descrição detalhada dos sintomas, início, evolução, fatores de melhora/piora
3. **Exame Físico**: Achados do exame físico, sinais vitais se mencionados
4. **Avaliação (Assessment)**: Impressão diagnóstica, hipóteses diagnósticas
5. **Plano (Plan)**: Condutas, medicações prescritas, exames solicitados, orientações

IMPORTANTE:
- Seja objetivo e use terminologia médica apropriada
- Se alguma seção não estiver presente na transcrição, indique "Não mencionado"
- Mantenha a precisão clínica
- Retorne APENAS um objeto JSON válido, sem texto adicional

Formato de resposta:
{
    "chief_complaint": "string",
    "history_present_illness": "string",
    "physical_exam": "string",
    "assessment": "string",
    "plan": "string"
}"""

            user_prompt = f"""Paciente: {patient_name}
{f'Idade: {patient_age} anos' if patient_age else ''}

Transcrição da consulta:
{transcription}

Gere o resumo estruturado em formato JSON."""

            response = await self.client.chat.completions.create(
                model=self.gpt_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1500
            )

            summary = json.loads(response.choices[0].message.content)

            logger.info(f"Resumo clínico gerado com sucesso")

            return summary

        except Exception as e:
            logger.error(f"Erro ao gerar resumo: {str(e)}")
            raise Exception(f"Falha ao gerar resumo: {str(e)}")

    async def suggest_icd10(
        self,
        summary: Dict,
        top_n: int = 3
    ) -> List[Dict]:
        """
        Sugere códigos CID-10 baseado no resumo da consulta

        Returns:
            [
                {
                    "code": "J00",
                    "description": "Nasofaringite aguda [resfriado comum]",
                    "confidence": "high"
                }
            ]
        """
        try:
            logger.info("Sugerindo códigos CID-10")

            system_prompt = """Você é um especialista em codificação CID-10 (Classificação Internacional de Doenças).

Baseado no resumo clínico fornecido, sugira os códigos CID-10 mais apropriados.

IMPORTANTE:
- Sugira até 3 códigos em ordem de relevância
- Use códigos CID-10 válidos e atuais
- Indique o nível de confiança: "high", "medium", "low"
- Retorne APENAS um objeto JSON válido

Formato de resposta:
{
    "suggestions": [
        {
            "code": "A00.0",
            "description": "Descrição completa do CID",
            "confidence": "high"
        }
    ]
}"""

            user_prompt = f"""Resumo clínico:

Queixa Principal: {summary.get('chief_complaint', 'Não mencionado')}
História: {summary.get('history_present_illness', 'Não mencionado')}
Avaliação: {summary.get('assessment', 'Não mencionado')}

Sugira os códigos CID-10 mais apropriados em formato JSON."""

            response = await self.client.chat.completions.create(
                model=self.gpt_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=500
            )

            result = json.loads(response.choices[0].message.content)
            suggestions = result.get('suggestions', [])[:top_n]

            logger.info(f"{len(suggestions)} códigos CID sugeridos")

            return suggestions

        except Exception as e:
            logger.error(f"Erro ao sugerir CID-10: {str(e)}")
            # Retornar lista vazia em caso de erro, não falhar todo o processo
            return []


# Singleton instance
_openai_service: Optional[OpenAIService] = None

def get_openai_service(api_key: str) -> OpenAIService:
    """Get or create OpenAI service instance"""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService(api_key)
    return _openai_service

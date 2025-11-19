"""
ICD Service - Base CID-10 e Sugestões
"""
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class ICDService:
    """
    Serviço para gerenciar códigos CID-10

    Nota: Este serviço pode ser expandido futuramente para incluir:
    - Base de dados completa de CID-10
    - Validação de códigos
    - Busca e autocomplete
    - Integração com bases oficiais
    """

    def __init__(self):
        # Base simplificada de CIDs comuns
        # TODO: Implementar integração com base completa
        self.common_codes = {
            "J00": "Nasofaringite aguda [resfriado comum]",
            "J06.9": "Infecção aguda das vias aéreas superiores não especificada",
            "K29.7": "Gastrite não especificada",
            "M54.5": "Dor lombar baixa",
            "I10": "Hipertensão essencial (primária)",
            "E11": "Diabetes mellitus não-insulino-dependente",
            "R50.9": "Febre não especificada",
            "R51": "Cefaleia",
            "R10.4": "Outras dores abdominais e as não especificadas",
        }

    def validate_code(self, code: str) -> bool:
        """
        Valida se um código CID-10 está no formato correto

        Args:
            code: Código CID-10 (ex: "J00", "E11.9")

        Returns:
            True se o formato é válido
        """
        import re
        # Padrão básico: Letra + 2 dígitos [+ . + 1-2 dígitos]
        pattern = r'^[A-Z]\d{2}(\.\d{1,2})?$'
        return bool(re.match(pattern, code))

    def get_description(self, code: str) -> Optional[str]:
        """
        Retorna a descrição de um código CID-10

        Args:
            code: Código CID-10

        Returns:
            Descrição do código ou None se não encontrado
        """
        return self.common_codes.get(code)

    def search_codes(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Busca códigos CID-10 por palavra-chave

        Args:
            query: Termo de busca
            limit: Número máximo de resultados

        Returns:
            Lista de códigos encontrados com descrições
        """
        query_lower = query.lower()
        results = []

        for code, description in self.common_codes.items():
            if query_lower in description.lower() or query_lower in code.lower():
                results.append({
                    "code": code,
                    "description": description
                })

                if len(results) >= limit:
                    break

        return results


# Singleton instance
_icd_service: Optional[ICDService] = None

def get_icd_service() -> ICDService:
    """Get or create ICD service instance"""
    global _icd_service
    if _icd_service is None:
        _icd_service = ICDService()
    return _icd_service

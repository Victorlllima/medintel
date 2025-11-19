# MedIntel Backend - Document Generation

Sistema de geração automática de documentos médicos em PDF.

## Funcionalidades

- ✅ **Atestado Médico**: Geração de atestados com CID-10 e dias de afastamento
- ✅ **Receita Médica**: Prescrições com múltiplos medicamentos
- ✅ **Declaração de Comparecimento**: Comprovante de consulta médica

## Estrutura do Projeto

```
backend/
├── app/
│   ├── api/
│   │   └── documents.py          # Endpoints da API
│   ├── core/
│   │   ├── database.py           # Conexão Supabase
│   │   └── security.py           # Autenticação
│   ├── services/
│   │   └── document_service.py   # Geração de PDFs
│   └── main.py                   # App FastAPI
├── tests/
│   └── test_document_service.py  # Testes unitários
└── requirements.txt
```

## Instalação

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt
```

## Executar a API

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API disponível em: http://localhost:8000

Documentação interativa: http://localhost:8000/docs

## Executar Testes

```bash
cd backend
python tests/test_document_service.py
```

Os testes irão:
1. Validar a geração de cada tipo de documento
2. Criar PDFs de exemplo na pasta `tests/samples/`

## Endpoints da API

### 1. Gerar Atestado Médico

```http
POST /api/documents/generate/certificate
Content-Type: application/json

{
  "consultation_id": "uuid-da-consulta",
  "icd_code": "J00",
  "icd_description": "Nasofaringite aguda",
  "days_off": 3,
  "start_date": "2024-01-15"
}
```

### 2. Gerar Receita Médica

```http
POST /api/documents/generate/prescription
Content-Type: application/json

{
  "consultation_id": "uuid-da-consulta",
  "medications": [
    {
      "name": "Paracetamol 500mg",
      "dosage": "1 comprimido",
      "frequency": "a cada 8 horas",
      "duration": "5 dias"
    }
  ]
}
```

### 3. Gerar Declaração de Comparecimento

```http
POST /api/documents/generate/declaration
Content-Type: application/json

{
  "consultation_id": "uuid-da-consulta",
  "start_time": "14:00",
  "end_time": "15:30"
}
```

### 4. Listar Documentos

```http
GET /api/documents/?consultation_id=uuid-da-consulta
```

## Tecnologias

- **FastAPI**: Framework web moderno e rápido
- **ReportLab**: Geração de PDFs
- **Supabase**: Backend as a Service (banco de dados e storage)
- **Pydantic**: Validação de dados

## Configuração do Supabase

### Bucket de Storage

Criar bucket `documents` no Supabase Storage:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT DO NOTHING;
```

### Políticas RLS

```sql
-- Upload de documentos
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Visualização de documentos
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Exemplo de Uso

```python
from app.services.document_service import get_document_service
import datetime

# Obter serviço
doc_service = get_document_service()

# Gerar atestado
pdf_buffer = doc_service.generate_medical_certificate(
    patient_name="João Silva",
    doctor_name="Dr. Maria Santos",
    doctor_crm="123456-SP",
    icd_code="J00",
    icd_description="Resfriado comum",
    days_off=3,
    start_date=datetime.date.today()
)

# Salvar em arquivo
with open("atestado.pdf", "wb") as f:
    f.write(pdf_buffer.getvalue())
```

## Próximos Passos

- [ ] Adicionar assinatura digital aos documentos
- [ ] Implementar templates customizáveis
- [ ] Suporte a múltiplos idiomas
- [ ] Geração de relatórios médicos complexos
- [ ] Integração com sistemas de agendamento

## Licença

Propriedade de MedIntel © 2024

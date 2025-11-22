# MedIntel - Sistema de Processamento Assíncrono de Consultas Médicas

Sistema completo de processamento assíncrono de consultas médicas com IA, utilizando transcrição automática (Whisper) e geração de resumos estruturados (GPT-4).

## 🚀 Funcionalidades

- **Upload de áudio de consultas** - Suporte para WAV, MP3, M4A
- **Processamento assíncrono** com Celery + Redis
- **Transcrição automática** usando OpenAI Whisper
- **Resumo estruturado** com GPT-4:
  - Queixa principal
  - História da doença atual
  - Exame físico
  - Avaliação/diagnóstico
  - Plano de tratamento
  - Prescrições
  - Sugestões de CID-10
- **Armazenamento** no Supabase Storage
- **API REST** com FastAPI

## 📋 Pré-requisitos

- Python 3.9+
- PostgreSQL
- Redis (Upstash já configurado)
- Conta Supabase
- Chave API da OpenAI

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/medintel.git
cd medintel
```

### 2. Crie um ambiente virtual

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medintel

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-supabase
SUPABASE_BUCKET=consultation-audios

# Redis (Upstash - já configurado)
REDIS_URL=redis://default:senha@endless-parrot-32941.upstash.io:6379
CELERY_BROKER_URL=redis://default:senha@endless-parrot-32941.upstash.io:6379
CELERY_RESULT_BACKEND=redis://default:senha@endless-parrot-32941.upstash.io:6379

# OpenAI
OPENAI_API_KEY=sk-sua-chave-openai
```

### 5. Crie as tabelas no banco de dados

```bash
python -m app.core.database
```

## 🏃 Executando o Sistema

O sistema possui **dois componentes** que devem rodar simultaneamente:

### 1. API FastAPI (Terminal 1)

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Worker Celery (Terminal 2)

```bash
cd backend

# Windows (usar --pool=solo)
celery -A app.workers.celery_app worker --loglevel=info --pool=solo

# Linux/Mac
celery -A app.workers.celery_app worker --loglevel=info
```

**⚠️ IMPORTANTE**: No Windows, é **obrigatório** usar o parâmetro `--pool=solo` pois o Celery não suporta o pool padrão no Windows.

## 📊 Fluxo de Processamento

```
1. Upload áudio → Status: "uploading"
2. Áudio salvo no Supabase → Status: "queued"
3. Worker inicia processamento → Status: "transcribing"
4. Transcrição concluída → Status: "summarizing"
5. Resumo gerado → Status: "completed"
6. Em caso de erro → Status: "failed"
```

## 🔌 Endpoints da API

### Upload de Consulta

```http
POST /api/consultations/upload
Content-Type: multipart/form-data

Campos:
- patient_id: string (ID do paciente)
- doctor_id: string (ID do médico)
- audio_file: file (arquivo de áudio)

Resposta: 201 Created
{
  "id": "uuid",
  "status": "queued",
  "patient_id": "...",
  "doctor_id": "...",
  "audio_file_path": "...",
  "task_id": "celery-task-id",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Obter Consulta

```http
GET /api/consultations/{consultation_id}

Resposta: 200 OK
{
  "id": "uuid",
  "status": "completed",
  "transcription": "Texto transcrito...",
  "summary": {
    "chief_complaint": "Dor de cabeça há 3 dias",
    "history_present_illness": "...",
    "physical_examination": "...",
    "assessment": "...",
    "plan": "...",
    "prescriptions": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "8/8h"
      }
    ],
    "cid10_suggestions": [
      {
        "code": "R51",
        "description": "Cefaleia"
      }
    ]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:32:00Z"
}
```

### Listar Consultas

```http
GET /api/consultations?patient_id=123&status=completed&page=1&page_size=20

Resposta: 200 OK
{
  "consultations": [...],
  "total": 50,
  "page": 1,
  "page_size": 20
}
```

### Reprocessar Consulta

```http
POST /api/consultations/{consultation_id}/reprocess

Resposta: 200 OK
{
  "id": "uuid",
  "status": "queued",
  "task_id": "new-task-id"
}
```

### Deletar Consulta

```http
DELETE /api/consultations/{consultation_id}

Resposta: 204 No Content
```

## 🔍 Monitoramento

### Verificar status do Worker

O worker Celery exibirá logs detalhados:

```
[2024-01-15 10:31:00,123] [uuid] Iniciando processamento da consulta
[2024-01-15 10:31:01,456] [uuid] Status: transcribing
[2024-01-15 10:31:02,789] [uuid] Baixando áudio do Supabase
[2024-01-15 10:31:15,234] [uuid] Transcrevendo áudio...
[2024-01-15 10:31:45,567] [uuid] Transcrição concluída: 1234 caracteres
[2024-01-15 10:31:45,789] [uuid] Status: summarizing
[2024-01-15 10:31:46,012] [uuid] Gerando resumo estruturado...
[2024-01-15 10:32:05,345] [uuid] Resumo gerado com sucesso
[2024-01-15 10:32:05,678] [uuid] Status: completed
```

### Verificar consulta via API

```bash
curl http://localhost:8000/api/consultations/{consultation_id}
```

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
medintel/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── consultations.py   # Endpoints da API
│   │   │   └── deps.py            # Dependências (get_db)
│   │   ├── core/
│   │   │   ├── config.py          # Configurações
│   │   │   └── database.py        # Setup do banco
│   │   ├── models/
│   │   │   └── consultation.py    # Modelo SQLAlchemy
│   │   ├── schemas/
│   │   │   └── consultation.py    # Schemas Pydantic
│   │   ├── workers/
│   │   │   ├── celery_app.py      # Configuração Celery
│   │   │   └── tasks.py           # Tasks de processamento
│   │   └── main.py                # Aplicação FastAPI
│   ├── requirements.txt
│   └── .env
└── README.md
```

### Criar tabelas do banco

```bash
python -m app.core.database
```

### Deletar todas as tabelas

```bash
python -m app.core.database drop
```

## 🐛 Troubleshooting

### Worker não processa tarefas

1. Verifique se o Redis está acessível:
   ```bash
   redis-cli -u redis://default:senha@endless-parrot-32941.upstash.io:6379 ping
   ```

2. Verifique os logs do worker Celery

3. Certifique-se de que ambos (API e Worker) estão usando o mesmo `.env`

### Erro ao transcrever

- Verifique se a chave OpenAI está correta
- Verifique se o formato do áudio é suportado
- Verifique se o arquivo não está corrompido

### Erro ao fazer upload

- Verifique as credenciais do Supabase
- Certifique-se de que o bucket existe
- Verifique as permissões do bucket

## 📝 Licença

MIT

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou PR.

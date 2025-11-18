# Documentação da API - MedIntel

API RESTful para automação de documentação clínica.

**Base URL**: `http://localhost:8000` (dev) ou `https://api.medintel.com.br` (prod)

**Documentação Interativa**: `{BASE_URL}/api/docs`

## Autenticação

Todos os endpoints (exceto `/health`, `/auth/login` e `/auth/register`) requerem autenticação via JWT.

### Header de Autenticação

```
Authorization: Bearer {access_token}
```

## Endpoints

### Health Check

#### GET /health

Verifica o status da API.

**Response**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "service": "MedIntel API"
}
```

---

### Autenticação

#### POST /api/auth/register

Criar nova conta de médico.

**Request Body**
```json
{
  "email": "medico@exemplo.com",
  "password": "senha-segura-123",
  "full_name": "Dr. João Silva",
  "crm": "12345/SP",
  "specialty": "Cardiologia"
}
```

**Response** `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "medico@exemplo.com",
    "full_name": "Dr. João Silva",
    "crm": "12345/SP",
    "specialty": "Cardiologia",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

#### POST /api/auth/login

Login com email e senha.

**Request Body** (Form Data)
```
username=medico@exemplo.com
password=senha-segura-123
```

**Response** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": { /* user object */ }
}
```

#### GET /api/auth/me

Obter perfil do usuário autenticado.

**Response** `200 OK`
```json
{
  "id": "uuid",
  "email": "medico@exemplo.com",
  "full_name": "Dr. João Silva",
  "crm": "12345/SP",
  "specialty": "Cardiologia",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": null
}
```

#### PATCH /api/auth/me

Atualizar perfil.

**Request Body**
```json
{
  "full_name": "Dr. João Pedro Silva",
  "specialty": "Cardiologia Intervencionista"
}
```

**Response** `200 OK` - Objeto do usuário atualizado

---

### Pacientes

#### GET /api/patients

Listar pacientes com paginação e busca.

**Query Parameters**
- `page` (int, default: 1)
- `page_size` (int, default: 20, max: 100)
- `search` (string, opcional) - busca por nome ou CPF

**Response** `200 OK`
```json
{
  "patients": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Maria Santos",
      "cpf": "123.456.789-00",
      "date_of_birth": "1980-05-15",
      "phone": "+55 11 98765-4321",
      "email": "maria@email.com",
      "allergies": ["Penicilina", "Dipirona"],
      "medical_history": "Hipertensão controlada",
      "consent_given": true,
      "consent_date": "2025-01-10T14:30:00Z",
      "created_at": "2025-01-10T14:30:00Z",
      "updated_at": null
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

#### POST /api/patients

Criar novo paciente.

**Request Body**
```json
{
  "name": "Maria Santos",
  "cpf": "12345678900",
  "date_of_birth": "1980-05-15",
  "phone": "+55 11 98765-4321",
  "email": "maria@email.com",
  "allergies": ["Penicilina"],
  "medical_history": "Hipertensão",
  "consent_given": true
}
```

**Response** `201 Created` - Objeto do paciente criado

#### GET /api/patients/{patient_id}

Detalhes de um paciente específico.

**Response** `200 OK` - Objeto do paciente

#### PATCH /api/patients/{patient_id}

Atualizar dados do paciente.

**Request Body** (campos opcionais)
```json
{
  "phone": "+55 11 91234-5678",
  "allergies": ["Penicilina", "Dipirona", "Ibuprofeno"]
}
```

**Response** `200 OK` - Objeto do paciente atualizado

#### DELETE /api/patients/{patient_id}

Deletar paciente (LGPD - direito ao esquecimento).

**Response** `204 No Content`

---

### Consultas

#### POST /api/consultations/upload

Upload de áudio de consulta para processamento.

**Request** (multipart/form-data)
```
patient_id: uuid
audio_file: arquivo.mp3 (max 100MB)
```

**Response** `201 Created`
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "user_id": "uuid",
  "audio_url": "https://...",
  "status": "queued",
  "created_at": "2025-01-15T15:00:00Z"
}
```

**Status Flow**:
1. `uploading` - Upload em progresso
2. `queued` - Na fila de processamento
3. `transcribing` - Transcrevendo com Whisper
4. `summarizing` - Gerando resumo e CIDs com GPT-4
5. `completed` - Concluído com sucesso
6. `failed` - Erro no processamento

#### GET /api/consultations

Listar consultas.

**Query Parameters**
- `page`, `page_size`
- `patient_id` (uuid, opcional)
- `status` (string, opcional)

**Response** `200 OK`
```json
{
  "consultations": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "status": "completed",
      "transcription": "Paciente relata dor no peito...",
      "summary": {
        "chief_complaint": "Dor torácica",
        "hda": "Início há 2 dias...",
        "physical_exam": "PA 140x90...",
        "assessment": "Suspeita de angina",
        "plan": "ECG, troponina, AAS 100mg"
      },
      "icd_suggestions": [
        {
          "code": "I20.0",
          "description": "Angina instável",
          "confidence": 0.89
        }
      ],
      "icd_codes": ["I20.0"],
      "created_at": "2025-01-15T15:00:00Z",
      "completed_at": "2025-01-15T15:04:32Z"
    }
  ],
  "total": 120,
  "page": 1,
  "page_size": 20,
  "total_pages": 6
}
```

#### GET /api/consultations/{consultation_id}

Detalhes de uma consulta.

**Response** `200 OK` - Objeto completo da consulta

#### PATCH /api/consultations/{consultation_id}

Editar transcrição, resumo ou CIDs.

**Request Body**
```json
{
  "transcription": "Texto editado manualmente...",
  "summary": {
    "chief_complaint": "Dor torácica intensa"
  },
  "icd_codes": ["I20.0", "I25.1"]
}
```

**Response** `200 OK` - Objeto da consulta atualizado

🔒 **Audit Log**: Edições são registradas em `audit_logs`

---

### Documentos

#### POST /api/documents

Gerar documento médico.

**Request Body - Atestado**
```json
{
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "document_type": "medical_certificate",
  "format": "pdf",
  "data": {
    "days_off": 3,
    "start_date": "2025-01-16",
    "icd_code": "I20.0",
    "observations": "Repouso absoluto"
  }
}
```

**Request Body - Receita**
```json
{
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "document_type": "prescription",
  "format": "pdf",
  "data": {
    "medications": [
      {
        "name": "AAS 100mg",
        "dosage": "100mg",
        "frequency": "1x ao dia",
        "duration": "Uso contínuo"
      }
    ],
    "observations": "Tomar após o café da manhã"
  }
}
```

**Response** `201 Created`
```json
{
  "id": "uuid",
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "user_id": "uuid",
  "document_type": "medical_certificate",
  "format": "pdf",
  "file_url": "https://storage.supabase.co/...",
  "data": { /* data object */ },
  "created_at": "2025-01-15T16:00:00Z"
}
```

#### GET /api/documents

Listar documentos.

**Query Parameters**
- `patient_id`, `consultation_id`, `document_type`

**Response** `200 OK` - Lista de documentos

---

### Dashboard

#### GET /api/dashboard/stats

Estatísticas da prática médica.

**Response** `200 OK`
```json
{
  "consultations_today": 5,
  "consultations_month": 87,
  "active_patients": 42,
  "total_patients": 156,
  "avg_consultation_duration": 18.5,
  "top_icds": [
    { "code": "I10", "count": 15 },
    { "code": "E11", "count": 12 }
  ],
  "consultations_by_day": [
    { "date": "2025-01-09", "count": 4 },
    { "date": "2025-01-10", "count": 6 }
  ]
}
```

---

### Busca

#### GET /api/search/consultations

Busca full-text em consultas.

**Query Parameters**
- `query` (string, required) - termo de busca
- `patient_id`, `start_date`, `end_date` (opcionais)
- `page`, `page_size`

**Response** `200 OK`
```json
{
  "consultations": [ /* array */ ],
  "total": 15,
  "page": 1,
  "page_size": 20,
  "total_pages": 1,
  "query": "dor torácica"
}
```

---

## Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `204 No Content` - Sucesso sem conteúdo
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `413 Payload Too Large` - Arquivo muito grande
- `422 Unprocessable Entity` - Validação falhou
- `500 Internal Server Error` - Erro no servidor

## Rate Limits

- Autenticação: 10 req/min
- Uploads: 5 req/min
- Demais endpoints: 60 req/min

## Webhooks (Roadmap)

Notificações de eventos:
- `consultation.completed`
- `consultation.failed`
- `document.generated`

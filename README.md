# MedIntel - Sistema de Geração de Documentos Médicos

Sistema completo para geração automática de documentos médicos em PDF, incluindo atestados, receitas e declarações de comparecimento.

## 🚀 Funcionalidades

### Tipos de Documentos Suportados

#### 1. Atestado Médico
- Nome completo do paciente
- CPF do paciente
- Data da consulta
- Número de dias de afastamento
- CID-10 (opcional)
- Assinatura digital do médico (nome + CRM)

#### 2. Receita Médica
- Nome completo do paciente
- Data da consulta
- Lista de medicamentos com posologia
- Validade da receita
- Assinatura digital do médico (nome + CRM)

#### 3. Declaração de Comparecimento
- Nome completo do paciente
- CPF do paciente
- Data e hora da consulta
- Duração aproximada
- Assinatura digital do médico (nome + CRM)

## 🏗️ Arquitetura

### Backend (FastAPI + Python)
- **FastAPI**: Framework web moderno e rápido
- **ReportLab**: Geração de PDFs
- **Supabase**: Banco de dados PostgreSQL e storage
- **Pydantic**: Validação de dados

### Frontend (React + Vite)
- **React**: Biblioteca UI
- **Vite**: Build tool rápido
- **Tailwind CSS**: Estilização
- **Axios**: Cliente HTTP

## 📦 Estrutura do Projeto

```
medintel/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos Pydantic
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Endpoints da API
│   │   ├── utils/           # Utilitários
│   │   └── middleware/      # Autenticação
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── services/        # API client
│   │   └── App.jsx
│   └── package.json
├── database/
│   ├── schema.sql           # Schema do banco
│   ├── seed.sql             # Dados de teste
│   └── storage_setup.sql    # Configuração do storage
└── README.md
```

## 🛠️ Instalação

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- Conta no Supabase

### 1. Setup do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script `database/schema.sql` no SQL Editor
3. (Opcional) Execute `database/seed.sql` para dados de teste
4. Crie um bucket de storage chamado `documents` (privado)
5. Execute `database/storage_setup.sql` para configurar as políticas

### 2. Setup do Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do Supabase

# Rodar servidor
python main.py
```

O backend estará disponível em: http://localhost:8000

API Docs: http://localhost:8000/api/docs

### 3. Setup do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a URL da API

# Rodar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:3000

## 📡 API Endpoints

### Documentos

#### POST `/api/documents/generate`
Gera um novo documento médico

**Request Body:**
```json
{
  "consultation_id": "uuid",
  "document_type": "medical_certificate|prescription|attendance_declaration",
  "additional_data": {
    // Dados específicos do tipo de documento
  }
}
```

**Exemplo - Atestado Médico:**
```json
{
  "consultation_id": "123e4567-e89b-12d3-a456-426614174000",
  "document_type": "medical_certificate",
  "additional_data": {
    "days_off": 3,
    "cid10": "J06.9",
    "notes": "Repouso absoluto"
  }
}
```

**Exemplo - Receita Médica:**
```json
{
  "consultation_id": "123e4567-e89b-12d3-a456-426614174000",
  "document_type": "prescription",
  "additional_data": {
    "medications": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "instructions": "1 comprimido a cada 8 horas",
        "duration": "7 dias"
      }
    ],
    "instructions": "Tomar com água",
    "validity_days": 30
  }
}
```

**Exemplo - Declaração de Comparecimento:**
```json
{
  "consultation_id": "123e4567-e89b-12d3-a456-426614174000",
  "document_type": "attendance_declaration",
  "additional_data": {
    "start_time": "14:00",
    "end_time": "15:00",
    "duration_minutes": 60
  }
}
```

#### GET `/api/documents?consultation_id={id}`
Lista documentos de uma consulta

#### GET `/api/documents/{document_id}`
Obtém detalhes de um documento

#### DELETE `/api/documents/{document_id}`
Remove um documento

## 🔒 Autenticação

A API usa JWT Bearer tokens para autenticação.

Adicione o token no header:
```
Authorization: Bearer <seu-token-jwt>
```

## 🗄️ Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema (médicos)
- **patients**: Pacientes
- **consultations**: Consultas médicas
- **documents**: Registros de documentos gerados

### Storage

- **Bucket**: `documents`
- **Estrutura**: `{user_id}/{consultation_id}/{document_type}_{timestamp}.pdf`
- **Acesso**: Privado com RLS (Row Level Security)

## 🎨 Interface do Usuário

### Componentes Principais

1. **DocumentGenerator**: Interface para gerar documentos
   - Botões para cada tipo de documento
   - Modais com formulários específicos
   - Validação de campos

2. **DocumentList**: Lista de documentos gerados
   - Visualização de documentos
   - Download de PDFs
   - Exclusão de documentos

## 🧪 Testando a Aplicação

### 1. Criar Usuário (Médico)
```sql
INSERT INTO users (email, full_name, role, crm, specialty)
VALUES ('medico@teste.com', 'Dr. Teste', 'doctor', 'CRM/SP 123456', 'Clínico Geral');
```

### 2. Criar Paciente
```sql
INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, cpf)
VALUES ('user-id-aqui', 'João', 'Silva', '1990-01-01', 'M', '12345678900');
```

### 3. Criar Consulta
```sql
INSERT INTO consultations (patient_id, doctor_id, consultation_date, status)
VALUES ('patient-id-aqui', 'user-id-aqui', NOW(), 'completed');
```

### 4. Gerar Documento
Use a interface web ou faça uma requisição POST para `/api/documents/generate`

## 📝 Desenvolvimento

### Adicionar Novo Tipo de Documento

1. Adicione o tipo em `backend/app/models/document.py`:
```python
class DocumentType(str, Enum):
    # ...
    NEW_TYPE = "new_type"
```

2. Crie o método de geração em `backend/app/services/document_generator.py`:
```python
def generate_new_type(self, patient_data, doctor_data, document_data):
    # Implementação
```

3. Adicione o caso no `_generate_pdf_by_type`:
```python
elif document_type == DocumentType.NEW_TYPE:
    return self.generator.generate_new_type(...)
```

4. Adicione à interface em `frontend/src/components/DocumentGenerator.jsx`

## 🚀 Deploy

### Backend
- **Recomendado**: Railway, Render, ou Heroku
- Configure as variáveis de ambiente
- Use `uvicorn` ou `gunicorn` como servidor

### Frontend
- **Recomendado**: Vercel, Netlify, ou Cloudflare Pages
- Build: `npm run build`
- Configure variáveis de ambiente

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 👥 Autores

Desenvolvido para MedIntel

## 🐛 Reportar Problemas

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.

## 📚 Recursos Adicionais

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [ReportLab Guide](https://docs.reportlab.com/)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev/)

---

**MedIntel** - Sistema de Gerenciamento de Documentos Médicos
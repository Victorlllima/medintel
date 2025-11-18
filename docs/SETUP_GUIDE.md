# Guia de Setup Completo - MedIntel

Este guia detalha o processo completo de configuração do MedIntel, desde a criação das contas necessárias até o deploy em produção.

## 📋 Índice

1. [Criação de Contas](#1-criação-de-contas)
2. [Configuração do Supabase](#2-configuração-do-supabase)
3. [Configuração OpenAI](#3-configuração-openai)
4. [Ambiente de Desenvolvimento](#4-ambiente-de-desenvolvimento)
5. [Deploy em Produção](#5-deploy-em-produção)
6. [Troubleshooting](#6-troubleshooting)

## 1. Criação de Contas

### 1.1 Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta (GitHub OAuth recomendado)
4. Crie um novo projeto:
   - Nome: `medintel-production` (ou nome desejado)
   - Database Password: Gere uma senha forte
   - Região: Escolha a mais próxima dos seus usuários (ex: São Paulo)

### 1.2 OpenAI

1. Acesse https://platform.openai.com
2. Crie uma conta ou faça login
3. Vá para API Keys: https://platform.openai.com/api-keys
4. Clique em "Create new secret key"
5. Copie e guarde a chave em local seguro (não será mostrada novamente)
6. Configure billing: https://platform.openai.com/account/billing

⚠️ **Importante**: Configure limites de gasto para evitar surpresas na fatura.

## 2. Configuração do Supabase

### 2.1 Criar Database Schema

1. No dashboard do Supabase, vá para "SQL Editor"
2. Clique em "New query"
3. Copie e cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Execute a query (botão "Run")
5. Verifique se não há erros

### 2.2 Configurar Storage

1. Vá para "Storage" no menu lateral
2. Crie os buckets:

**Bucket: consultations**
- Name: `consultations`
- Public: ❌ (privado)
- File size limit: 100MB
- Allowed MIME types: `audio/*`

**Bucket: documents**
- Name: `documents`
- Public: ❌ (privado)
- File size limit: 10MB
- Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 2.3 Configurar Storage Policies

Execute no SQL Editor:

```sql
-- Policies para consultations bucket
CREATE POLICY "Users can upload own consultation audio" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'consultations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own consultation audio" ON storage.objects
FOR SELECT USING (
  bucket_id = 'consultations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies para documents bucket
CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2.4 Obter Credenciais

1. Vá para "Project Settings" > "API"
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Chave anônima (para frontend)
   - **service_role key**: Chave de serviço (para backend - MANTENHA SEGURA)

## 3. Configuração OpenAI

### 3.1 Verificar Modelos Disponíveis

Certifique-se de ter acesso a:
- ✅ `whisper-1` (transcrição)
- ✅ `gpt-4-turbo-preview` (resumos e CID)

### 3.2 Configurar Rate Limits

Recomendações para produção:
- Tier 1: 3 RPM (requests/min) no Whisper
- Considere upgrade para Tier 2+ se houver volume maior

### 3.3 Monitorar Uso

Configure alertas em https://platform.openai.com/usage
- Alerta em 80% do limite mensal
- Alerta de gasto diário

## 4. Ambiente de Desenvolvimento

### 4.1 Clonar Repositório

```bash
git clone https://github.com/Victorlllima/medintel.git
cd medintel
```

### 4.2 Configurar Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Copiar e configurar .env
cp .env.example .env
```

Edite `backend/.env`:

```env
DEBUG=true
SECRET_KEY=$(openssl rand -hex 32)

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

OPENAI_API_KEY=sk-your-key

REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

CORS_ORIGINS=["http://localhost:3000"]
```

### 4.3 Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Copiar e configurar .env.local
cp .env.local.example .env.local
```

Edite `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4.4 Executar com Docker Compose

```bash
# Na raiz do projeto
docker-compose up --build
```

Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### 4.5 Executar Manualmente (Dev)

**Terminal 1 - Redis**
```bash
docker run -p 6379:6379 redis:7-alpine
```

**Terminal 2 - Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 - Celery Worker**
```bash
cd backend
source venv/bin/activate
celery -A app.workers.celery_app worker --loglevel=info
```

**Terminal 4 - Frontend**
```bash
cd frontend
npm run dev
```

## 5. Deploy em Produção

### 5.1 Backend (Railway/Render)

**Railway**

1. Crie conta em https://railway.app
2. New Project > Deploy from GitHub
3. Selecione o repositório `medintel`
4. Configure service:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Adicione Redis:
   - New > Database > Redis
6. Configure variáveis de ambiente (todas do .env)
7. Deploy!

**Celery Worker** (serviço separado)
- New Service do mesmo repo
- Start Command: `celery -A app.workers.celery_app worker --loglevel=info`
- Mesmas env vars

### 5.2 Frontend (Vercel)

1. Crie conta em https://vercel.com
2. Import Git Repository
3. Framework Preset: Next.js
4. Root Directory: `frontend`
5. Adicione variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (URL do backend Railway)
6. Deploy!

### 5.3 Configurar Domínio Customizado

**Backend (Railway)**
- Settings > Networking > Custom Domain
- Adicione `api.seudominio.com.br`

**Frontend (Vercel)**
- Project Settings > Domains
- Adicione `seudominio.com.br`

### 5.4 HTTPS e Certificados

✅ Railway e Vercel gerenciam automaticamente certificados SSL

## 6. Troubleshooting

### Erro: "Supabase client error"

**Causa**: Credenciais incorretas

**Solução**:
1. Verifique `SUPABASE_URL` e keys
2. Confirme que usou `SUPABASE_SERVICE_KEY` no backend
3. Confirme que usou `SUPABASE_ANON_KEY` no frontend

### Erro: "OpenAI rate limit exceeded"

**Causa**: Muitas requisições simultâneas

**Solução**:
1. Implemente queue com rate limiting
2. Upgrade do tier OpenAI
3. Adicione retry logic com backoff

### Erro: "Celery worker não processa tasks"

**Causa**: Redis não conectado ou worker não rodando

**Solução**:
```bash
# Verificar Redis
redis-cli ping  # deve retornar PONG

# Verificar workers
celery -A app.workers.celery_app inspect active
```

### Erro: "Upload failed - file too large"

**Causa**: Arquivo maior que 100MB

**Solução**:
1. Ajuste `MAX_UPLOAD_SIZE` no backend
2. Aumente limite no Supabase Storage
3. Comprima o áudio antes do upload

### Frontend não conecta ao Backend

**Causa**: CORS ou URL incorreta

**Solução**:
1. Verifique `NEXT_PUBLIC_API_URL` no frontend
2. Adicione URL do frontend em `CORS_ORIGINS` no backend
3. Teste endpoint: `curl https://api.seudominio.com.br/health`

## 📞 Precisa de Ajuda?

- 📚 Documentação: [docs/](.)
- 🐛 Issues: https://github.com/Victorlllima/medintel/issues
- 📧 Email: support@medintel.com.br

# Guia de Instalação Rápida - MedIntel

Este guia fornece instruções passo a passo para configurar o sistema MedIntel.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Python 3.11 ou superior
- Node.js 18 ou superior
- npm ou yarn
- Conta no Supabase (gratuita)

## 🚀 Instalação Rápida

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha os dados:
   - Nome do projeto: medintel
   - Database Password: (escolha uma senha forte)
   - Region: (escolha a mais próxima)
4. Aguarde a criação do projeto (2-3 minutos)

#### 1.1 Criar Banco de Dados

1. No painel do Supabase, vá em "SQL Editor"
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `database/schema.sql`
4. Cole no editor e clique em "Run"
5. Aguarde a execução (deve mostrar "Success")

#### 1.2 Criar Dados de Teste (Opcional)

1. No SQL Editor, clique em "New Query"
2. Copie o conteúdo do arquivo `database/seed.sql`
3. Cole e execute ("Run")

#### 1.3 Configurar Storage

1. No painel do Supabase, vá em "Storage"
2. Clique em "Create bucket"
3. Nome: `documents`
4. Marque "Private bucket"
5. Clique em "Create bucket"
6. Volte ao SQL Editor e execute o arquivo `database/storage_setup.sql`

#### 1.4 Obter Credenciais

1. No painel do Supabase, vá em "Settings" → "API"
2. Anote:
   - Project URL
   - anon/public key
   - service_role key (mantenha em segredo!)

### 2. Configurar Backend

```bash
# Navegue até a pasta backend
cd backend

# Crie ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
JWT_SECRET=sua-senha-jwt-aleatoria-aqui
```

Para gerar um JWT_SECRET seguro:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Configurar Frontend

```bash
# Navegue até a pasta frontend
cd frontend

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

## 🎮 Executar a Aplicação

### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate no Windows
python main.py
```

O backend estará em: http://localhost:8000
Documentação da API: http://localhost:8000/api/docs

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

O frontend estará em: http://localhost:3000

## ✅ Testar a Instalação

1. Acesse http://localhost:3000
2. Você verá a interface do MedIntel
3. Clique em um dos botões para gerar documento
4. Preencha os campos e clique em "Gerar Documento"
5. O documento deve aparecer na lista abaixo

## 🔧 Solução de Problemas

### Erro: "Supabase connection failed"

- Verifique se as credenciais no `.env` estão corretas
- Certifique-se de que o projeto Supabase está ativo
- Verifique se copiou a URL completa (incluindo https://)

### Erro: "Table does not exist"

- Execute o arquivo `database/schema.sql` no Supabase SQL Editor
- Verifique se todos os comandos foram executados com sucesso

### Erro: "Storage bucket not found"

- Crie o bucket `documents` no Supabase Storage
- Execute o arquivo `database/storage_setup.sql`
- Verifique se o bucket está marcado como "Private"

### Erro: "Port already in use"

Backend:
```bash
# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Frontend:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "Module not found"

Backend:
```bash
cd backend
pip install -r requirements.txt
```

Frontend:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Próximos Passos

1. Leia o [README.md](README.md) para documentação completa
2. Explore a API em http://localhost:8000/api/docs
3. Personalize os templates de documentos em `backend/app/services/document_generator.py`
4. Adicione autenticação real (atualmente usa mock)

## 🆘 Precisa de Ajuda?

- Verifique a documentação completa no [README.md](README.md)
- Consulte os logs no terminal para mensagens de erro detalhadas
- Abra uma issue no repositório

---

Desenvolvido para MedIntel

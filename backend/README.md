# MedIntel Backend 🏥

API backend para o MedIntel - Sistema de documentação clínica automatizada com IA.

## Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **Python 3.13** - Linguagem de programação
- **Supabase** - Backend as a Service (Auth + Database + Storage)
- **OpenAI** - Transcrição (Whisper) e Resumos (GPT-4)

## Recursos Principais

### 🎙️ Transcrição de Áudio
- Whisper API para transcrição precisa de consultas médicas
- Suporte para português brasileiro
- Geração de timestamps e segmentos

### 📝 Resumo Estruturado
- GPT-4 para gerar resumos no formato SOAP
- Extração automática de informações clínicas
- Queixa principal, história, exame físico, avaliação e plano

### 🏥 Sugestão de CID-10
- IA sugere códigos CID-10 baseados no resumo clínico
- Níveis de confiança (high, medium, low)
- Validação e confirmação pelo médico

## Instalação

### 1. Criar ambiente virtual

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 2. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key
SUPABASE_SERVICE_KEY=sua-service-key

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxx

# Security
SECRET_KEY=gere-uma-chave-secreta-forte
```

## Uso

### Iniciar servidor de desenvolvimento

```bash
uvicorn main:app --reload
```

O servidor estará disponível em: `http://localhost:8000`

### Documentação da API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Estrutura do Projeto

```
backend/
├── app/
│   ├── api/              # Endpoints da API
│   │   └── consultations.py
│   ├── core/             # Configurações centrais
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── services/         # Serviços de negócio
│   │   ├── openai_service.py
│   │   └── icd_service.py
│   └── workers/          # Tarefas em background
│       └── tasks.py
├── main.py               # Ponto de entrada da aplicação
├── requirements.txt      # Dependências Python
└── .env.example          # Exemplo de variáveis de ambiente
```

## Pipeline de Processamento

1. **Upload de Áudio** → Criação de registro (status: `queued`)
2. **Background Task** → Disparo automático
3. **Transcrição** → Whisper API (status: `transcribing`)
4. **Resumo** → GPT-4 gera SOAP (status: `summarizing`)
5. **CID-10** → Sugestões automáticas
6. **Conclusão** → Atualização final (status: `completed`)

## Endpoints Principais

### POST `/api/v1/consultations/process/{consultation_id}`
Dispara o processamento de uma consulta

### GET `/api/v1/consultations/{consultation_id}/status`
Retorna o status atual do processamento

### GET `/api/v1/consultations/{consultation_id}`
Retorna dados completos da consulta

### GET `/api/v1/consultations/`
Lista consultas com filtros opcionais

### PATCH `/api/v1/consultations/{consultation_id}/icd-codes`
Atualiza códigos CID-10 confirmados

## Desenvolvimento

### Requisitos

- Python 3.13+
- Conta OpenAI com API key
- Projeto Supabase configurado

### Próximos Passos

- [ ] Implementar upload de áudio via API
- [ ] Adicionar autenticação completa
- [ ] Implementar websockets para status em tempo real
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD
- [ ] Deploy em produção

## Licença

Proprietário - MedIntel © 2024

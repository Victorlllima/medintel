# MedIntel - Documentação Clínica Automatizada por IA

Sistema SaaS que automatiza a documentação clínica através de processamento de áudio + IA, gerando transcrições, resumos estruturados, sugestões de CID-10 e documentos médicos prontos para uso.

## 📋 Visão Geral

MedIntel reduz até **70% do tempo** gasto com documentação administrativa, permitindo que médicos foquem no que realmente importa: o cuidado com o paciente.

### Principais Funcionalidades

- 🎤 **Upload e Transcrição Automática** - Transcrição de consultas em áudio (Whisper API)
- 📝 **Resumo Estruturado** - IA gera resumo clínico organizado (GPT-4)
- 🏥 **Sugestão de CID-10** - Top 3 sugestões de diagnóstico
- 📄 **Geração de Documentos** - Atestados, receitas e declarações em PDF/DOCX
- 👥 **Gestão de Pacientes** - CRUD completo com histórico
- 📊 **Dashboard Analytics** - Métricas e KPIs da prática médica
- 🔍 **Busca Avançada** - Busca full-text em transcrições
- 🔒 **Compliance LGPD** - Consentimento, criptografia e audit logs

## 🏗️ Arquitetura

### Stack Tecnológica

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- Supabase Client

**Backend**
- FastAPI (Python 3.11+)
- Supabase (PostgreSQL + Auth + Storage)
- Celery + Redis (filas assíncronas)
- OpenAI (Whisper + GPT-4)

**Infraestrutura**
- Docker & Docker Compose
- Redis (cache e broker)
- Supabase (BaaS)

### Estrutura do Projeto

```
medintel/
├── backend/                # API FastAPI
│   ├── app/
│   │   ├── api/           # Rotas/endpoints
│   │   ├── core/          # Config, database, security
│   │   ├── models/        # Modelos de dados
│   │   ├── schemas/       # Schemas Pydantic
│   │   ├── services/      # Lógica de negócio
│   │   └── workers/       # Celery tasks
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # Next.js App
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utils, API client
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── supabase/             # Database migrations
│   └── migrations/
├── docker-compose.yml
└── README.md
```

## 🚀 Setup Rápido

### Pré-requisitos

- Docker & Docker Compose
- Conta Supabase
- API Key OpenAI

### 1. Clone o Repositório

```bash
git clone https://github.com/Victorlllima/medintel.git
cd medintel
```

### 2. Configure Variáveis de Ambiente

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.local.example frontend/.env.local
```

Edite os arquivos `.env` com suas credenciais (veja [Setup Guide](docs/SETUP_GUIDE.md))

### 3. Execute com Docker

```bash
docker-compose up --build
```

Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

## 📚 Documentação

- 📘 [Setup Completo](docs/SETUP_GUIDE.md) - Guia detalhado de instalação
- 📗 [API Documentation](docs/API.md) - Referência completa da API

## 🔐 Segurança e Compliance

### LGPD

- ✅ Consentimento explícito do paciente
- ✅ Logs de auditoria imutáveis
- ✅ Direito ao esquecimento
- ✅ Criptografia AES-256 at-rest
- ✅ TLS 1.3 in-transit

### CFM (Conselho Federal de Medicina)

- ✅ CRM em todos os documentos
- ✅ Identificação clara de autoria
- ✅ Histórico de versões

## 📈 Roadmap

### MVP (v0.1.0) ✅
- Autenticação e gestão de usuários
- CRUD de pacientes
- Upload e transcrição de áudio
- Resumo estruturado e sugestão de CID
- Geração de documentos PDF/DOCX
- Dashboard básico
- Busca em consultas

### Fase 2 (v0.2.0) 🔄
- Player de áudio com waveform
- Notificações em tempo real
- Templates customizáveis
- Multi-tenant (clínicas)
- Exportação em lote

### Fase 3 (v1.0.0) 📅
- Integração com EHR/prontuários
- Prescrição digital certificada
- Apps mobile (iOS/Android)
- Verificação de interações medicamentosas

## 🧪 Testes

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test

# E2E
npm run test:e2e
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja LICENSE para detalhes.

## 📞 Suporte

- 📧 Email: support@medintel.com.br
- 📚 Docs: https://docs.medintel.com.br
- 🐛 Issues: https://github.com/Victorlllima/medintel/issues

## 👨‍💻 Autores

**Victor Lima** - [@Victorlllima](https://github.com/Victorlllima)

---

**MedIntel** - Transformando a documentação clínica com IA 🚀

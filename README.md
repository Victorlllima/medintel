# MedIntel 🏥🤖

Sistema de documentação clínica automatizada com IA

## Visão Geral

MedIntel é um SaaS completo para documentação clínica automatizada que utiliza IA para:

- 🎙️ **Transcrever** consultas médicas com alta precisão (Whisper)
- 📝 **Gerar** resumos estruturados no formato SOAP (GPT-4)
- 🏥 **Sugerir** códigos CID-10 automaticamente
- ⚡ **Economizar** tempo dos profissionais de saúde

## Arquitetura

```
medintel/
├── backend/          # API FastAPI + Python 3.13
│   ├── OpenAI Whisper (transcrição)
│   ├── GPT-4 (resumos SOAP)
│   ├── Supabase (auth + database + storage)
│   └── Background tasks (processamento assíncrono)
│
└── frontend/         # Next.js (em desenvolvimento)
    ├── Upload de áudio
    ├── Visualização de transcrições
    └── Gestão de consultas
```

## Tecnologias

### Backend
- FastAPI
- Python 3.13
- OpenAI API (Whisper + GPT-4)
- Supabase
- AsyncIO para processamento paralelo

### Frontend (Próximo)
- Next.js
- TypeScript
- Tailwind CSS
- Supabase Client

## Status do Projeto

- ✅ **Backend**: Integração OpenAI completa
- ✅ **Transcrição**: Pipeline de processamento implementado
- ✅ **Resumos**: Geração automática SOAP
- ✅ **CID-10**: Sugestões por IA
- 🚧 **Frontend**: Em desenvolvimento
- 🚧 **Deploy**: Planejado

## Como Usar

### Backend

Veja instruções detalhadas em [backend/README.md](backend/README.md)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Configure suas variáveis de ambiente
uvicorn main:app --reload
```

## Licença

Proprietário - MedIntel © 2024
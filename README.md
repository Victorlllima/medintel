# MedIntel - Sistema de Documentação Clínica Automatizada 📄

SaaS de geração automática de documentos médicos com inteligência artificial.

## Funcionalidades Implementadas

### ✅ Geração de Documentos em PDF
- **Atestado Médico**: Com CID-10 e período de afastamento
- **Receita Médica**: Prescrições com múltiplos medicamentos
- **Declaração de Comparecimento**: Comprovante de consulta

## Tecnologias

- **Backend**: FastAPI + Python 3.13
- **PDF Generation**: ReportLab
- **Database**: Supabase
- **Storage**: Supabase Storage

## Estrutura do Projeto

```
medintel/
├── backend/
│   ├── app/
│   │   ├── api/              # Endpoints REST
│   │   ├── services/         # Lógica de negócio
│   │   ├── core/             # Configurações e autenticação
│   │   └── main.py           # Aplicação FastAPI
│   ├── tests/                # Testes unitários
│   └── requirements.txt
└── README.md
```

## Quick Start

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/Victorlllima/medintel.git
cd medintel

# Instalar dependências
cd backend
pip install -r requirements.txt
```

### 2. Executar a API

```bash
uvicorn app.main:app --reload --port 8000
```

Acesse: http://localhost:8000/docs

### 3. Executar Testes

```bash
python tests/test_document_service.py
```

## Documentação Completa

Ver [backend/README.md](backend/README.md) para documentação detalhada.

## Roadmap

- [x] Geração de atestados médicos
- [x] Geração de receitas médicas
- [x] Declarações de comparecimento
- [ ] Assinatura digital
- [ ] Templates customizáveis
- [ ] Integração com IA para sugestões
- [ ] Dashboard frontend

## Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

© 2024 MedIntel. Todos os direitos reservados.
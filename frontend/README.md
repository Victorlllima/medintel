# MedIntel Frontend

Frontend do sistema MedIntel - Sistema de Gestão de Consultas Médicas.

## Funcionalidades

- ✅ Listagem de consultas médicas
- ✅ Visualização completa de detalhes da consulta
- ✅ Player de áudio integrado
- ✅ Exibição de transcrição e resumo
- ✅ Sugestões de CID-10
- ✅ Geração de documentos (Atestado, Receita, Declaração)
- ✅ Estados de loading e tratamento de erros
- ✅ Reprocessamento de consultas falhadas
- ✅ Exclusão de consultas

## Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **TanStack Query** - Gerenciamento de estado e cache
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com a URL da API

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── consultations/     # Página de consultas
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página inicial
│   ├── components/            # Componentes React
│   │   ├── consultations/     # Componentes de consultas
│   │   └── ui/                # Componentes de UI
│   ├── hooks/                 # Hooks customizados
│   ├── lib/                   # Utilitários e configuração
│   ├── providers/             # Context Providers
│   └── types/                 # Tipos TypeScript
├── public/                    # Arquivos estáticos
└── package.json
```

## Variáveis de Ambiente

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Uso

### Visualizar Detalhes de uma Consulta

1. Acesse a página de consultas em `/consultations`
2. Clique em qualquer card de consulta
3. O modal de detalhes será aberto com todas as informações

### Gerar Documentos

1. Abra os detalhes de uma consulta concluída
2. Role até a seção "Gerar Documentos"
3. Clique no botão do documento desejado
4. O PDF será baixado automaticamente

### Reprocessar Consulta Falhada

1. Abra os detalhes de uma consulta com status "failed"
2. Clique em "Reprocessar Consulta"
3. A consulta será enviada para processamento novamente

## API Endpoints Utilizados

- `GET /api/consultations` - Lista todas as consultas
- `GET /api/consultations/{id}` - Detalhes de uma consulta
- `POST /api/consultations` - Criar nova consulta
- `DELETE /api/consultations/{id}` - Excluir consulta
- `POST /api/consultations/{id}/reprocess` - Reprocessar consulta
- `POST /api/consultations/{id}/documents/{type}` - Gerar documento

## Licença

Proprietary

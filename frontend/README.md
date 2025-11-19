# MedIntel Frontend

Dashboard e interface web para o MedIntel - Sistema de Documentação Clínica Automatizada com IA.

## Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e autenticação
- **React Query** - Gerenciamento de estado
- **Recharts** - Gráficos e visualizações
- **Framer Motion** - Animações
- **Lucide React** - Ícones

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── consultations/      # Gestão de consultas
│   │   └── patients/           # Gestão de pacientes
│   ├── components/
│   │   ├── Dashboard/          # Componentes do dashboard
│   │   ├── UI/                 # Componentes reutilizáveis
│   │   └── Layout/             # Componentes de layout
│   ├── lib/                    # Utilitários e configurações
│   └── styles/                 # Estilos e tema
├── package.json
└── README.md
```

## Instalação

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse http://localhost:3000

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## Componentes Principais

### Dashboard
- **StatCard** - Cards de estatísticas com ícones e trends
- **ConsultationsChart** - Gráfico de consultas dos últimos 7 dias
- **useDashboardData** - Hook customizado para buscar dados do dashboard

### UI Components
- **Button** - Botão reutilizável com variantes e loading states
- **Badge** - Badge para status e tags
- **EmptyState** - Estado vazio com call-to-action
- **LoadingSkeleton** - Loading placeholder
- **Card** - Container genérico

## Design System

O projeto utiliza um design system baseado em Tailwind CSS com cores customizadas:

- **Primary**: Azul (#0066CC)
- **Success**: Verde (#16A34A)
- **Danger**: Vermelho (#DC2626)
- **Warning**: Laranja (#F59E0B)
- **Neutral**: Cinza (50-900)

Veja `src/styles/theme.ts` para mais detalhes.

## Features Implementadas

- Dashboard com métricas em tempo real
- Visualização de consultas por período
- Lista de consultas recentes
- Quick actions para principais ações
- Loading states e empty states
- Animações suaves com Framer Motion
- Design responsivo
- Toast notifications

## Próximos Passos

1. Implementar páginas de consultas
2. Implementar gestão de pacientes
3. Adicionar autenticação
4. Integrar com backend
5. Implementar testes

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

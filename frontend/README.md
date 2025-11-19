# MedIntel Frontend

Sistema de documentação clínica automatizada por IA para médicos brasileiros.

## Tecnologias

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Framer Motion
- TanStack Query

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Funcionalidades

### Gravação de Áudio em Tempo Real

- Gravação de consultas médicas com feedback visual
- Pausar e retomar gravações
- Preview de áudio antes do envio
- Upload automático para Supabase Storage
- Limite de 2 horas de gravação

### Gerenciamento de Consultas

- Listagem de consultas gravadas
- Status de transcrição em tempo real
- Histórico completo

## Configuração do Supabase

### Storage Bucket

Crie um bucket chamado `consultations` no Supabase Storage com as seguintes políticas RLS:

```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Users can upload own consultation audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'consultations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura de próprios arquivos
CREATE POLICY "Users can view own consultation audio"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'consultations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Database Tables

As seguintes tabelas são necessárias:

- `users` - Usuários do sistema
- `patients` - Pacientes cadastrados
- `consultations` - Consultas gravadas

## Estrutura de Componentes

```
src/
├── app/                    # Next.js App Router
│   ├── consultations/     # Páginas de consultas
│   ├── layout.tsx         # Layout principal
│   └── providers.tsx      # Providers (React Query, Toast)
├── components/
│   └── AudioRecorder/     # Componentes de gravação
│       ├── useAudioRecorder.ts
│       ├── RecorderControls.tsx
│       ├── AudioPreview.tsx
│       ├── AudioVisualizer.tsx
│       ├── PatientSelector.tsx
│       └── TimerDisplay.tsx
└── lib/
    ├── supabase.ts        # Cliente Supabase
    ├── supabaseStorage.ts # Upload de áudio
    └── audioUtils.ts      # Utilitários de áudio
```

## Build

Para criar uma build de produção:

```bash
npm run build
npm start
```

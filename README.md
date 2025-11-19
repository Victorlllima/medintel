# MedIntel 🎙️

Sistema de documentação clínica automatizada por IA para médicos brasileiros.

## 🎯 Visão Geral

MedIntel é um SaaS que permite médicos gravarem consultas médicas e automaticamente gerarem documentação clínica completa através de IA. O sistema oferece gravação de áudio em tempo real, transcrição automática e geração de documentos médicos estruturados.

## ✨ Funcionalidades Principais

### 🎙️ Gravação de Áudio em Tempo Real

- Interface profissional de gravação com feedback visual
- Controles intuitivos: Gravar, Pausar, Retomar, Parar
- Timer preciso com contador em tempo real
- Visualização de áudio (waveform/volume meter)
- Preview antes do envio
- Suporte para gravações de até 2 horas
- Otimizações de áudio (noise suppression, echo cancellation)

### 📋 Gerenciamento de Consultas

- Seleção de pacientes com busca
- Upload automático para Supabase Storage
- Listagem de consultas com status de processamento
- Histórico completo de gravações

### 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco de dados
- Armazenamento seguro de áudio

## 🚀 Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **TanStack Query** - State management
- **React Hot Toast** - Notificações

### Backend/Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Row Level Security

### APIs Web
- **MediaRecorder API** - Gravação de áudio
- **Web Audio API** - Análise e visualização de áudio

## 📁 Estrutura do Projeto

```
medintel/
├── frontend/
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── consultations/          # Páginas de consultas
│   │   │   │   ├── new/page.tsx        # Nova consulta (gravação)
│   │   │   │   └── page.tsx            # Listagem de consultas
│   │   │   ├── layout.tsx              # Layout raiz
│   │   │   ├── providers.tsx           # React Query & Toast providers
│   │   │   ├── globals.css             # Estilos globais
│   │   │   └── page.tsx                # Home (redireciona)
│   │   │
│   │   ├── components/
│   │   │   └── AudioRecorder/          # Sistema de gravação
│   │   │       ├── index.tsx           # Barrel export
│   │   │       ├── useAudioRecorder.ts # Hook principal
│   │   │       ├── RecorderControls.tsx
│   │   │       ├── TimerDisplay.tsx
│   │   │       ├── AudioPreview.tsx
│   │   │       ├── AudioVisualizer.tsx
│   │   │       └── PatientSelector.tsx
│   │   │
│   │   └── lib/
│   │       ├── supabase.ts             # Cliente Supabase
│   │       ├── supabaseStorage.ts      # Upload de áudio
│   │       └── audioUtils.ts           # Utilitários
│   │
│   ├── public/                         # Arquivos estáticos
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.example
│
└── README.md
```

## 🛠️ Configuração e Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### 1. Clone o Repositório

```bash
git clone https://github.com/Victorlllima/medintel.git
cd medintel/frontend
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a ANON KEY do projeto

#### 3.2 Configure as Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 3.3 Crie as Tabelas do Banco

Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Users table (geralmente já existe com Supabase Auth)
-- Se não existir, será criada automaticamente

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- em segundos
  status TEXT NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
  transcription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Users can view own patients"
  ON patients FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own patients"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for consultations
CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations"
  ON consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 3.4 Configure o Storage Bucket

1. Acesse o Supabase Dashboard → Storage
2. Crie um novo bucket chamado `consultations`
3. Configure como **private**
4. Adicione as seguintes políticas RLS:

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

### 4. Execute o Projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📖 Uso

### Gravando uma Consulta

1. Acesse `/consultations/new`
2. Selecione um paciente
3. Clique no botão vermelho para iniciar a gravação
4. Use os controles para pausar/retomar
5. Clique em "Parar" quando finalizar
6. Revise o áudio no preview
7. Clique em "Enviar para Transcrição"

### Visualizando Consultas

1. Acesse `/consultations`
2. Veja a lista de todas as consultas gravadas
3. Verifique o status de cada transcrição

## 🎨 Design System

### Cores

- **Primary**: `#0066CC` (Azul médico)
- **Success**: `#16A34A` (Verde)
- **Warning**: `#F59E0B` (Amarelo)
- **Danger**: `#DC2626` (Vermelho)
- **Neutral**: Escala de cinza

### Componentes

Todos os componentes seguem design responsivo e acessível:

- Botões com estados hover/active
- Animações suaves com Framer Motion
- Feedback visual em tempo real
- Suporte a teclado e leitores de tela

## 🧪 Testes

Para testar a funcionalidade de gravação:

1. ✅ Permissão de microfone é solicitada
2. ✅ Gravação inicia corretamente
3. ✅ Timer funciona
4. ✅ Pausar e retomar funcionam
5. ✅ Preview de áudio funciona
6. ✅ Upload para Supabase funciona
7. ✅ Registro é criado no banco
8. ✅ Responsivo em mobile e desktop

## 📱 Compatibilidade

- ✅ Chrome/Edge 85+
- ✅ Firefox 79+
- ✅ Safari 14+
- ✅ Mobile (iOS Safari, Chrome Android)

## 🚧 Roadmap

- [ ] Transcrição automática com IA
- [ ] Geração de documentos médicos
- [ ] Edição de transcrições
- [ ] Templates de documentos
- [ ] Exportação em PDF
- [ ] Integração com prontuário eletrônico
- [ ] App mobile nativo

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Victor Lima**
- GitHub: [@Victorlllima](https://github.com/Victorlllima)

## 🙏 Agradecimentos

- Anthropic Claude pela assistência no desenvolvimento
- Comunidade Next.js
- Supabase team

---

**MedIntel** - Transformando consultas médicas em documentação profissional com IA 🎙️✨

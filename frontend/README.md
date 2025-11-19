# MedIntel Frontend

Frontend do MedIntel - SaaS de documentação clínica automatizada para médicos brasileiros.

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend-as-a-Service (Auth + Database)
- **React Query** - Gerenciamento de estado servidor
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones

## Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase

## Configuração

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Victorlllima/medintel.git
   cd medintel/frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env.local` na raiz do projeto frontend:
   ```bash
   cp .env.example .env.local
   ```

   Edite `.env.local` e adicione suas credenciais do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

4. **Configure o banco de dados no Supabase:**

   Execute o seguinte SQL no SQL Editor do Supabase:

   ```sql
   -- Criar tabela de pacientes
   CREATE TABLE patients (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name VARCHAR(255) NOT NULL,
     cpf VARCHAR(14) NOT NULL,
     date_of_birth DATE NOT NULL,
     phone VARCHAR(20),
     email VARCHAR(255),
     allergies JSONB DEFAULT '[]',
     medical_history TEXT,
     consent_given BOOLEAN NOT NULL DEFAULT false,
     consent_date TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Criar índices
   CREATE INDEX idx_patients_user_id ON patients(user_id);
   CREATE INDEX idx_patients_cpf ON patients(cpf);
   CREATE INDEX idx_patients_name ON patients(name);

   -- Habilitar RLS (Row Level Security)
   ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

   -- Política: usuários só podem ver seus próprios pacientes
   CREATE POLICY "Users can view their own patients"
     ON patients FOR SELECT
     USING (auth.uid() = user_id);

   -- Política: usuários podem criar seus próprios pacientes
   CREATE POLICY "Users can create their own patients"
     ON patients FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Política: usuários podem atualizar seus próprios pacientes
   CREATE POLICY "Users can update their own patients"
     ON patients FOR UPDATE
     USING (auth.uid() = user_id);

   -- Política: usuários podem deletar seus próprios pacientes
   CREATE POLICY "Users can delete their own patients"
     ON patients FOR DELETE
     USING (auth.uid() = user_id);

   -- Trigger para atualizar updated_at automaticamente
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER update_patients_updated_at
     BEFORE UPDATE ON patients
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at_column();
   ```

5. **Execute o projeto em desenvolvimento:**
   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css           # Estilos globais
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── page.tsx              # Página inicial
│   │   ├── providers.tsx         # Providers (React Query)
│   │   └── patients/
│   │       └── page.tsx          # Página de gestão de pacientes
│   │
│   ├── components/
│   │   └── Patients/
│   │       ├── PatientForm.tsx           # Formulário de paciente
│   │       └── usePatientsData.ts        # Hook com React Query
│   │
│   └── lib/
│       ├── supabase.ts           # Cliente Supabase
│       └── validations.ts        # Validações (CPF, telefone)
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

## Funcionalidades Implementadas

### Gestão de Pacientes (/patients)

- ✅ Listagem de pacientes com busca
- ✅ Cadastro de novos pacientes
- ✅ Validação de CPF brasileiro
- ✅ Formatação automática de CPF e telefone
- ✅ Gestão de alergias
- ✅ Histórico médico
- ✅ Consentimento LGPD para gravação
- ✅ Exclusão com confirmação
- ✅ Busca por nome ou CPF
- ✅ Empty states

### Validações

- CPF brasileiro com dígitos verificadores
- Campos obrigatórios (nome, CPF, data de nascimento)
- Consentimento obrigatório conforme LGPD

## Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linter
```

## Próximos Passos

- [ ] Implementar edição de pacientes
- [ ] Adicionar paginação para grandes volumes
- [ ] Criar página de detalhes do paciente
- [ ] Implementar exportação de dados
- [ ] Adicionar filtros avançados
- [ ] Implementar upload de documentos

## Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Faça suas alterações
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## Licença

Propriedade privada - Todos os direitos reservados

## Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

# Contribuindo para o MedIntel

Obrigado por considerar contribuir com o MedIntel! 🎉

## Como Contribuir

### Reportar Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/Victorlllima/medintel/issues)
2. Abra uma nova issue com:
   - Título claro e descritivo
   - Passos para reproduzir o problema
   - Comportamento esperado vs. atual
   - Screenshots (se aplicável)
   - Informações do ambiente (OS, browser, versão)

### Sugerir Features

1. Abra uma issue com a tag `enhancement`
2. Descreva:
   - O problema que a feature resolve
   - Como você imagina que funcione
   - Casos de uso

### Pull Requests

1. **Fork** o repositório
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/medintel.git`
3. **Crie uma branch**: `git checkout -b feature/minha-feature`
4. **Faça suas mudanças**
5. **Commit**: `git commit -m 'feat: adiciona nova funcionalidade'`
6. **Push**: `git push origin feature/minha-feature`
7. **Abra um Pull Request**

## Convenções de Código

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação, sem mudanças de código
refactor: refatoração de código
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

### Python (Backend)

- Siga [PEP 8](https://pep8.org/)
- Use type hints
- Docstrings para funções públicas
- Max line length: 100 caracteres

```python
def process_audio(file_path: str) -> dict:
    """
    Process audio file and generate transcription.

    Args:
        file_path: Path to audio file

    Returns:
        Dictionary with transcription and metadata
    """
    pass
```

### TypeScript (Frontend)

- Use TypeScript strict mode
- Props interfaces para componentes
- Componentes funcionais com hooks
- Named exports preferidos

```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>
}
```

## Testes

### Backend

```bash
cd backend
pytest
pytest --cov=app  # com coverage
```

### Frontend

```bash
cd frontend
npm test
npm run test:e2e  # testes E2E
```

### Requisitos

- Novos features devem incluir testes
- Coverage mínimo: 70%
- Testes E2E para fluxos críticos

## Code Review

Todas as mudanças passam por code review. Esperamos:

- ✅ Código limpo e bem documentado
- ✅ Testes passando
- ✅ Sem conflitos com `main`
- ✅ Commits seguindo convenção
- ✅ PR description clara

## Primeiros Passos

Boas issues para começar:
- Issues com label `good first issue`
- Issues com label `help wanted`

## Dúvidas?

- 💬 Abra uma [Discussion](https://github.com/Victorlllima/medintel/discussions)
- 📧 Email: dev@medintel.com.br

## Código de Conduta

Seja respeitoso, inclusivo e profissional. Valorizamos contribuições de todas as pessoas.

---

Obrigado por contribuir! 🚀

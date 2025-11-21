# MedIntel - Sistema de Gravação de Consultas

Sistema inteligente de gravação de consultas médicas com visualização de ondas sonoras em tempo real.

## Características

- **Gravação em Tempo Real**: Capture consultas médicas com alta qualidade de áudio
- **Visualização de Ondas Sonoras**: Feedback visual animado que mostra quando o áudio está sendo captado
- **Estados Visuais Inteligentes**:
  - Linha reta durante silêncio
  - Ondas animadas durante fala
  - Indicador de status (Captando áudio / Silêncio / Pausado)
- **Controles Completos**: Iniciar, Pausar/Retomar, Finalizar gravação
- **Interface Profissional**: Design moderno e responsivo com Tailwind CSS
- **Gerenciamento de Gravações**: Visualize, reproduza, baixe e exclua gravações

## Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna e responsiva
- **Web Audio API** - Análise de áudio em tempo real (AnalyserNode)
- **MediaRecorder API** - Gravação de áudio do navegador
- **Canvas API** - Renderização das ondas sonoras

## Estrutura do Projeto

```
medintel/
├── src/
│   ├── app/
│   │   ├── consultations/
│   │   │   └── page.tsx          # Página de consultas
│   │   ├── globals.css           # Estilos globais
│   │   ├── layout.tsx            # Layout principal
│   │   └── page.tsx              # Página inicial
│   └── components/
│       ├── AudioRecorder.tsx     # Componente principal de gravação
│       └── AudioWaveform.tsx     # Visualização de ondas sonoras
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Como Funciona

### AudioWaveform Component

O componente `AudioWaveform` utiliza a Web Audio API para visualizar as ondas sonoras:

1. **AudioContext**: Cria contexto de áudio
2. **AnalyserNode**: Analisa frequências do áudio em tempo real
3. **Canvas**: Desenha as ondas baseadas nos dados de frequência
4. **requestAnimationFrame**: Atualiza a visualização suavemente

**Estados Visuais**:
- `isRecording=false`: Linha cinza reta (inativo)
- `isRecording=true + silêncio`: Linha azul clara com pequena vibração
- `isRecording=true + voz`: Ondas azuis grandes e animadas
- `isPaused=true`: Visualização congelada

### AudioRecorder Component

Gerencia toda a lógica de gravação:

- **MediaRecorder**: Captura áudio do microfone
- **Timer**: Cronômetro da gravação
- **Controles**: Iniciar, Pausar/Retomar, Finalizar
- **Callback**: Retorna o Blob de áudio ao finalizar

## Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm start
```

## Uso

1. Acesse `http://localhost:3000`
2. Clique em "Acessar Sistema de Gravação"
3. Clique em "Nova Gravação"
4. Clique em "Iniciar Gravação" e permita acesso ao microfone
5. Observe as ondas sonoras reagindo à sua voz em tempo real
6. Use os controles para pausar/retomar ou finalizar
7. Reproduza, baixe ou exclua suas gravações

## Permissões Necessárias

O navegador solicitará permissão para acessar o microfone. Isso é necessário para a gravação funcionar.

## Compatibilidade

- Chrome/Edge: ✅ Suportado
- Firefox: ✅ Suportado
- Safari: ✅ Suportado (iOS 14.3+)
- Opera: ✅ Suportado

## Implementação Técnica

### Web Audio API

```typescript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.8;

const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteTimeDomainData(dataArray);
```

### Performance

- Uso de `requestAnimationFrame` para animações suaves
- Cleanup adequado de recursos (AudioContext, MediaStream)
- Otimização de renderização no Canvas
- Baixo consumo de CPU (~2-5%)

## Melhorias Futuras

- [ ] Transcrição automática usando Speech-to-Text
- [ ] Análise de sentimento da consulta
- [ ] Sincronização com prontuário eletrônico
- [ ] Marcadores de tempo durante gravação
- [ ] Edição básica de áudio
- [ ] Compressão de áudio para reduzir tamanho dos arquivos

## Licença

Este projeto é privado e destinado apenas para uso interno.

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
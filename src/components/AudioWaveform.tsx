'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isPaused: boolean;
}

export default function AudioWaveform({ stream, isRecording, isPaused }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();
  const [hasAudio, setHasAudio] = useState(false);

  useEffect(() => {
    if (!stream || !isRecording) {
      // Cleanup ao parar gravação
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Desenhar estado inativo
      drawInactiveState();
      setHasAudio(false);
      return;
    }

    // Configurar Web Audio API
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    // Iniciar animação
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isRecording]);

  const drawInactiveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Desenhar linha reta (estado inativo)
    ctx.strokeStyle = '#d1d5db'; // gray-300
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const animate = () => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    // Se pausado, congelar visualização
    if (isPaused) {
      return;
    }

    analyser.getByteTimeDomainData(dataArray);

    const width = canvas.width;
    const height = canvas.height;

    // Calcular volume médio para detectar se há áudio
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += Math.abs(normalized);
    }
    const average = sum / dataArray.length;
    setHasAudio(average > 0.01);

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Estilo da linha
    ctx.lineWidth = 2;
    ctx.strokeStyle = average > 0.01 ? '#0ea5e9' : '#94a3b8'; // blue-500 quando há som, slate-400 quando silêncio
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Desenhar estado inicial
    drawInactiveState();
  }, []);

  return (
    <div className="relative w-full h-24 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        className="w-full h-full"
        style={{ maxWidth: '400px' }}
      />

      {/* Indicador de status */}
      <div className="absolute top-2 right-2">
        {isRecording && !isPaused && (
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${hasAudio ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-gray-600">
              {hasAudio ? 'Captando áudio' : 'Silêncio'}
            </span>
          </div>
        )}
        {isPaused && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-gray-600">Pausado</span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client'

import { useEffect, useRef, useState } from 'react'

interface AudioVisualizerProps {
  isRecording: boolean
  stream?: MediaStream | null
}

export function AudioVisualizer({ isRecording, stream }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const [volume, setVolume] = useState(0)

  useEffect(() => {
    if (!isRecording || !stream) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setVolume(0)
      return
    }

    // Create audio context and analyser
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    source.connect(analyser)
    analyserRef.current = analyser

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateVolume = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)

      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength
      setVolume(Math.min(100, (average / 255) * 100))

      animationFrameRef.current = requestAnimationFrame(updateVolume)
    }

    updateVolume()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      audioContext.close()
    }
  }, [isRecording, stream])

  return (
    <div className="h-32 bg-neutral-100 rounded-lg flex items-center justify-center p-6">
      <div className="w-full space-y-4">
        <div className="text-center text-sm font-medium text-neutral-600">
          {isRecording ? 'Gravando...' : 'Aguardando gravação'}
        </div>

        {/* Simple volume bar */}
        <div className="w-full bg-neutral-200 h-4 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-100 ease-out"
            style={{
              width: `${volume}%`
            }}
          />
        </div>

        {/* Visual bars */}
        <div className="flex items-center justify-center gap-1 h-16">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full transition-all duration-100"
              style={{
                height: isRecording
                  ? `${Math.random() * volume + 10}%`
                  : '10%',
                opacity: isRecording ? 0.7 : 0.3
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

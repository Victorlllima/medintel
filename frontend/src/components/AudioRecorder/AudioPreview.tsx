import { Play, Pause, RotateCcw, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { formatTime } from '@/lib/audioUtils'

interface AudioPreviewProps {
  audioUrl: string
  duration: number
  onReset: () => void
  onSubmit: () => void
  isUploading: boolean
}

export function AudioPreview({
  audioUrl,
  duration,
  onReset,
  onSubmit,
  isUploading
}: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime))
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          Gravação Concluída
        </h3>
        <p className="text-neutral-600">
          Duração: {formatTime(duration)}
        </p>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />

      <div className="bg-neutral-100 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-mono text-neutral-600">
            {formatTime(currentTime)}
          </span>
          <span className="text-sm font-mono text-neutral-600">
            {formatTime(duration)}
          </span>
        </div>

        <div className="w-full bg-neutral-300 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-100"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
            }}
          />
        </div>

        <div className="flex justify-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-primary hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-colors"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          disabled={isUploading}
          className="flex-1 px-6 py-3 border-2 border-neutral-300 rounded-lg text-neutral-700 font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          Regravar
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={isUploading}
          className="flex-1 px-6 py-3 bg-primary hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload size={20} />
              Enviar para Transcrição
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

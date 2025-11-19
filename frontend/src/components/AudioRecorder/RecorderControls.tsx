import { Mic, Pause, Square, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface RecorderControlsProps {
  state: 'idle' | 'recording' | 'paused'
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function RecorderControls({
  state,
  onStart,
  onPause,
  onResume,
  onStop
}: RecorderControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {state === 'idle' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
          aria-label="Iniciar gravação"
        >
          <Mic size={32} />
        </motion.button>
      )}

      {state === 'recording' && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPause}
            className="w-16 h-16 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center shadow-lg"
            aria-label="Pausar gravação"
          >
            <Pause size={24} />
          </motion.button>

          <motion.button
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg cursor-default"
            aria-label="Gravando"
          >
            <Mic size={32} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="w-16 h-16 rounded-full bg-neutral-700 hover:bg-neutral-800 text-white flex items-center justify-center shadow-lg"
            aria-label="Parar gravação"
          >
            <Square size={24} />
          </motion.button>
        </>
      )}

      {state === 'paused' && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResume}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg"
            aria-label="Retomar gravação"
          >
            <Play size={24} />
          </motion.button>

          <div className="w-20 h-20 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg">
            <Pause size={32} />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="w-16 h-16 rounded-full bg-neutral-700 hover:bg-neutral-800 text-white flex items-center justify-center shadow-lg"
            aria-label="Parar gravação"
          >
            <Square size={24} />
          </motion.button>
        </>
      )}
    </div>
  )
}

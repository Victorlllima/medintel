import { formatTime } from '@/lib/audioUtils'

interface TimerDisplayProps {
  seconds: number
  isRecording?: boolean
}

export function TimerDisplay({ seconds, isRecording }: TimerDisplayProps) {
  return (
    <div className="font-mono text-4xl font-bold text-neutral-900 flex items-center justify-center gap-2">
      {formatTime(seconds)}
      {isRecording && (
        <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  )
}

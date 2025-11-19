import { useState, useRef, useCallback, useEffect } from 'react'
import { getSupportedMimeType } from '@/lib/audioUtils'

type RecorderState = 'idle' | 'requesting_permission' | 'ready' | 'recording' | 'paused' | 'stopped' | 'uploading' | 'error'

interface UseAudioRecorderReturn {
  state: RecorderState
  audioBlob: Blob | null
  audioUrl: string | null
  duration: number
  currentTime: number
  error: string | null
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  cancelRecording: () => void
  isRecording: boolean
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const pauseTimeRef = useRef<number>(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Solicitar permissão e iniciar gravação
  const startRecording = useCallback(async () => {
    try {
      setState('requesting_permission')
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      const mimeType = getSupportedMimeType()
      if (!mimeType) {
        throw new Error('Seu navegador não suporta gravação de áudio')
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)
        setState('stopped')

        // Parar timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
        }
      }

      mediaRecorder.start(1000) // Captura chunks a cada 1s
      setState('recording')
      startTimeRef.current = Date.now() - pauseTimeRef.current

      // Iniciar timer
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        setCurrentTime(Math.floor(elapsed / 1000))

        // Limite de 2 horas
        if (elapsed >= 7200000) {
          stopRecording()
        }
      }, 100)

    } catch (err: any) {
      console.error('Erro ao acessar microfone:', err)

      let errorMessage = 'Erro ao acessar o microfone'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão de microfone negada. Por favor, permita o acesso ao microfone.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Nenhum microfone encontrado. Conecte um microfone e tente novamente.'
      }

      setError(errorMessage)
      setState('error')
    }
  }, [])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause()
      pauseTimeRef.current = Date.now() - startTimeRef.current
      setState('paused')

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [state])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume()
      startTimeRef.current = Date.now() - pauseTimeRef.current
      setState('recording')

      // Retomar timer
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        setCurrentTime(Math.floor(elapsed / 1000))

        if (elapsed >= 7200000) {
          stopRecording()
        }
      }, 100)
    }
  }, [state])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setDuration(currentTime)
    }
  }, [currentTime])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }

    setAudioBlob(null)
    setAudioUrl(null)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    audioChunksRef.current = []
    pauseTimeRef.current = 0
    setState('idle')
  }, [audioUrl])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return {
    state,
    audioBlob,
    audioUrl,
    duration,
    currentTime,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    isRecording: state === 'recording'
  }
}

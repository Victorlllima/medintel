'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadAudio } from '@/lib/supabaseStorage'
import toast from 'react-hot-toast'
import {
  useAudioRecorder,
  RecorderControls,
  TimerDisplay,
  AudioPreview,
  PatientSelector,
  AudioVisualizer
} from '@/components/AudioRecorder'
import { AlertCircle } from 'lucide-react'

export default function NewConsultationPage() {
  const router = useRouter()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
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
    isRecording
  } = useAudioRecorder()

  const handleSubmit = async () => {
    if (!audioBlob || !selectedPatientId) {
      toast.error('Selecione um paciente e grave o áudio')
      return
    }

    setIsUploading(true)

    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!userData.user) {
        throw new Error('Usuário não autenticado')
      }

      // Upload audio to Supabase Storage
      const fileName = 'consultation.webm'
      const { publicUrl, error: uploadError } = await uploadAudio(
        audioBlob,
        userData.user.id,
        fileName
      )

      if (uploadError) throw new Error(uploadError)

      // Create consultation record
      const { data: consultation, error: dbError } = await supabase
        .from('consultations')
        .insert({
          patient_id: selectedPatientId,
          user_id: userData.user.id,
          audio_url: publicUrl,
          duration: duration,
          status: 'queued'
        })
        .select()
        .single()

      if (dbError) throw dbError

      toast.success('Áudio enviado! Transcrição será processada em até 5 minutos.')
      router.push('/consultations')

    } catch (err: any) {
      console.error('Erro ao enviar:', err)
      toast.error(err.message || 'Erro ao enviar áudio')
    } finally {
      setIsUploading(false)
    }
  }

  const handleStartRecording = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente antes de gravar')
      return
    }
    await startRecording()
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Nova Consulta</h1>
          <p className="text-neutral-600">
            Grave a consulta médica para gerar documentação automática
          </p>
        </div>

        {/* Patient Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <PatientSelector
            selectedPatientId={selectedPatientId}
            onSelect={setSelectedPatientId}
          />
        </div>

        {/* Recording Interface */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Erro de Gravação</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}

          {state === 'stopped' && audioUrl ? (
            <AudioPreview
              audioUrl={audioUrl}
              duration={duration}
              onReset={cancelRecording}
              onSubmit={handleSubmit}
              isUploading={isUploading}
            />
          ) : (
            <div className="space-y-8">
              {/* Timer */}
              <div className="text-center">
                <TimerDisplay
                  seconds={currentTime}
                  isRecording={state === 'recording'}
                />
              </div>

              {/* Audio Visualizer */}
              <AudioVisualizer isRecording={state === 'recording'} />

              {/* Recorder Controls */}
              <RecorderControls
                state={
                  state === 'idle' || state === 'ready' || state === 'requesting_permission'
                    ? 'idle'
                    : state
                }
                onStart={handleStartRecording}
                onPause={pauseRecording}
                onResume={resumeRecording}
                onStop={stopRecording}
              />

              {/* Instructions */}
              {state === 'idle' && (
                <div className="text-center text-sm text-neutral-500 space-y-2">
                  <p>Clique no botão vermelho para iniciar a gravação</p>
                  <p className="text-xs">
                    Você poderá pausar, retomar e parar a gravação a qualquer momento
                  </p>
                </div>
              )}

              {(state === 'recording' || state === 'paused') && (
                <div className="text-center text-sm text-neutral-500">
                  <p>Gravação em andamento - Tempo limite: 2 horas</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-neutral-900 mb-2">Dicas para uma boa gravação:</h3>
          <ul className="text-sm text-neutral-700 space-y-1">
            <li>• Escolha um ambiente silencioso</li>
            <li>• Fale de forma clara e pausada</li>
            <li>• Mantenha o microfone próximo</li>
            <li>• Você pode pausar e retomar a gravação a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

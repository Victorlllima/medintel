'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, type Consultation } from '@/lib/supabase'
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Play,
  Pause,
  AlertCircle,
  ClipboardList,
  Stethoscope,
  FilePlus,
  Printer
} from 'lucide-react'
import { formatTime } from '@/lib/audioUtils'
import { motion } from 'framer-motion'

export default function ConsultationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const consultationId = params?.id as string

  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (consultationId) {
      fetchConsultation()
    }
  }, [consultationId])

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ''
      }
    }
  }, [audioElement])

  const fetchConsultation = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single()

      if (error) throw error

      setConsultation(data)
    } catch (err: any) {
      console.error('Error fetching consultation:', err)
      setError('Erro ao carregar consulta')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'processing':
        return 'bg-yellow-100 text-yellow-700'
      case 'queued':
        return 'bg-blue-100 text-blue-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />
      case 'processing':
        return <Clock size={16} />
      case 'queued':
        return <Clock size={16} />
      case 'failed':
        return <XCircle size={16} />
      default:
        return <FileText size={16} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída'
      case 'processing':
        return 'Processando'
      case 'queued':
        return 'Na fila'
      case 'failed':
        return 'Falhou'
      default:
        return status
    }
  }

  const toggleAudio = () => {
    if (!consultation?.audio_url) return

    if (!audioElement) {
      const audio = new Audio(consultation.audio_url)
      audio.onended = () => setIsPlaying(false)
      setAudioElement(audio)
      audio.play()
      setIsPlaying(true)
    } else {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        audioElement.play()
        setIsPlaying(true)
      }
    }
  }

  const handleGenerateDocument = (type: string) => {
    // TODO: Implementar geração de documentos
    console.log(`Gerando documento: ${type}`)
    alert(`Funcionalidade de gerar ${type} será implementada em breve`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando consulta...</p>
        </div>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {error || 'Consulta não encontrada'}
            </h2>
            <button
              onClick={() => router.push('/consultations')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para Consultas
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/consultations')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para Consultas
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Consulta #{consultation.id.slice(0, 8)}
              </h1>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span>Duração: {formatTime(consultation.duration)}</span>
                <span>
                  {new Date(consultation.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                consultation.status
              )}`}
            >
              {getStatusIcon(consultation.status)}
              {getStatusText(consultation.status)}
            </span>
          </div>
        </div>

        {/* Audio Player */}
        {consultation.audio_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAudio}
                  className="w-12 h-12 rounded-full bg-primary hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                </motion.button>
                <div>
                  <h3 className="font-semibold text-neutral-900">Áudio da Consulta</h3>
                  <p className="text-sm text-neutral-600">
                    {isPlaying ? 'Reproduzindo...' : 'Clique para reproduzir'}
                  </p>
                </div>
              </div>
              <a
                href={consultation.audio_url}
                download
                className="px-4 py-2 text-primary hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Baixar
              </a>
            </div>
          </motion.div>
        )}

        {/* Document Generation Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <FilePlus size={24} />
            Gerar Documentos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGenerateDocument('Receita')}
              disabled={consultation.status !== 'completed'}
              className="px-4 py-3 border border-neutral-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileText size={20} />
              Receita Médica
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGenerateDocument('Atestado')}
              disabled={consultation.status !== 'completed'}
              className="px-4 py-3 border border-neutral-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ClipboardList size={20} />
              Atestado
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGenerateDocument('Relatório')}
              disabled={consultation.status !== 'completed'}
              className="px-4 py-3 border border-neutral-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Printer size={20} />
              Relatório Médico
            </motion.button>
          </div>
        </motion.div>

        {/* Transcription */}
        {consultation.status === 'completed' && consultation.transcription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FileText size={24} />
              Transcrição
            </h2>
            <div className="prose max-w-none">
              <p className="text-neutral-700 whitespace-pre-wrap">{consultation.transcription}</p>
            </div>
          </motion.div>
        )}

        {/* Summary */}
        {consultation.status === 'completed' && consultation.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Stethoscope size={24} />
              Resumo Clínico
            </h2>
            <div className="space-y-4">
              {consultation.summary.chief_complaint && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Queixa Principal</h3>
                  <p className="text-neutral-700">{consultation.summary.chief_complaint}</p>
                </div>
              )}
              {consultation.summary.hda && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    História da Doença Atual (HDA)
                  </h3>
                  <p className="text-neutral-700">{consultation.summary.hda}</p>
                </div>
              )}
              {consultation.summary.physical_exam && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Exame Físico</h3>
                  <p className="text-neutral-700">{consultation.summary.physical_exam}</p>
                </div>
              )}
              {consultation.summary.assessment && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    Avaliação / Hipótese Diagnóstica
                  </h3>
                  <p className="text-neutral-700">{consultation.summary.assessment}</p>
                </div>
              )}
              {consultation.summary.plan && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    Conduta / Plano Terapêutico
                  </h3>
                  <p className="text-neutral-700">{consultation.summary.plan}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ICD Suggestions */}
        {consultation.status === 'completed' && consultation.icd_suggestions && consultation.icd_suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <ClipboardList size={24} />
              Sugestões de CID-10
            </h2>
            <div className="space-y-3">
              {consultation.icd_suggestions.map((icd, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-primary">{icd.code}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {Math.round(icd.confidence * 100)}% confiança
                      </span>
                    </div>
                    <p className="text-neutral-700">{icd.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Processing State */}
        {consultation.status !== 'completed' && consultation.status !== 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
          >
            <Clock size={48} className="mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Consulta em Processamento
            </h3>
            <p className="text-neutral-600">
              Aguarde enquanto processamos a transcrição e análise da consulta.
              Atualize a página em alguns instantes.
            </p>
            <button
              onClick={fetchConsultation}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Atualizar Status
            </button>
          </motion.div>
        )}

        {/* Error State */}
        {consultation.status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <XCircle size={48} className="mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Erro no Processamento
            </h3>
            <p className="text-neutral-600">
              Ocorreu um erro ao processar esta consulta. Entre em contato com o suporte.
            </p>
            {consultation.error_message && (
              <p className="text-sm text-red-600 mt-2">
                Detalhes: {consultation.error_message}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

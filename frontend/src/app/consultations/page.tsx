'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Consultation } from '@/lib/supabase'
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatTime } from '@/lib/audioUtils'
import { motion } from 'framer-motion'

export default function ConsultationsPage() {
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setConsultations(data || [])
    } catch (err: any) {
      console.error('Error fetching consultations:', err)
      setError('Erro ao carregar consultas')
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

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Consultas</h1>
            <p className="text-neutral-600">
              Visualize e gerencie suas consultas gravadas
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/consultations/new')}
            className="px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Consulta
          </motion.button>
        </div>

        {/* Consultations List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12 text-neutral-500">
              Carregando consultas...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              {error}
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-neutral-600 mb-6">
                Comece gravando sua primeira consulta
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/consultations/new')}
                className="px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Nova Consulta
              </motion.button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  onClick={() => router.push(`/consultations/${consultation.id}`)}
                  className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-900">
                          Consulta #{consultation.id.slice(0, 8)}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                            consultation.status
                          )}`}
                        >
                          {getStatusIcon(consultation.status)}
                          {getStatusText(consultation.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span>Duração: {formatTime(consultation.duration)}</span>
                        <span>
                          Data:{' '}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

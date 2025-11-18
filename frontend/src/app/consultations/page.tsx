'use client'

import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'
import Link from 'next/link'
import type { Consultation, ConsultationStatus } from '@/types'

const statusColors: Record<ConsultationStatus, string> = {
  uploading: 'badge-info',
  queued: 'badge-info',
  transcribing: 'badge-warning',
  summarizing: 'badge-warning',
  completed: 'badge-success',
  failed: 'badge-error',
}

const statusLabels: Record<ConsultationStatus, string> = {
  uploading: 'Enviando',
  queued: 'Na fila',
  transcribing: 'Transcrevendo',
  summarizing: 'Analisando',
  completed: 'Concluída',
  failed: 'Erro',
}

export default function ConsultationsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ConsultationStatus | ''>('')

  const { data, isLoading } = useQuery({
    queryKey: ['consultations', { page, status: statusFilter }],
    queryFn: () => api.getConsultations({ page, page_size: 20, status: statusFilter || undefined }),
    refetchInterval: 5000, // Refresh every 5s to update status
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Consultas</h1>
            <p className="text-neutral-500">Histórico de consultas processadas</p>
          </div>
          <Link href="/consultations/new" className="btn btn-primary">
            🎤 Nova Consulta
          </Link>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ConsultationStatus | '')}
              className="input flex-1"
            >
              <option value="">Todos os status</option>
              <option value="queued">Na fila</option>
              <option value="transcribing">Transcrevendo</option>
              <option value="summarizing">Analisando</option>
              <option value="completed">Concluídas</option>
              <option value="failed">Com erro</option>
            </select>
          </div>
        </div>

        {/* Consultations List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-neutral-100 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-neutral-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data?.consultations?.map((consultation: Consultation) => (
                <Link
                  key={consultation.id}
                  href={`/consultations/${consultation.id}`}
                  className="card hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Consulta {new Date(consultation.created_at).toLocaleDateString('pt-BR')}
                        </h3>
                        <span className={`badge ${statusColors[consultation.status as ConsultationStatus]}`}>
                          {statusLabels[consultation.status as ConsultationStatus]}
                        </span>
                      </div>

                      <div className="text-sm text-neutral-500 space-y-1">
                        <p>
                          Criada em:{' '}
                          {new Date(consultation.created_at).toLocaleString('pt-BR')}
                        </p>
                        {consultation.duration && (
                          <p>Duração: {Math.round(consultation.duration / 60)} min</p>
                        )}
                        {consultation.icd_codes && consultation.icd_codes.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {consultation.icd_codes.map((code, i) => (
                              <span key={i} className="badge badge-info">
                                {code}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {consultation.transcription && (
                        <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                          {consultation.transcription}
                        </p>
                      )}
                    </div>
                    <div className="text-primary">→</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-neutral-500">
                  Página {page} de {data.total_pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="btn btn-secondary"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && (!data?.consultations || data.consultations.length === 0) && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🩺</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma consulta encontrada</h3>
            <p className="text-neutral-500 mb-6">
              Comece fazendo upload de uma consulta
            </p>
            <Link href="/consultations/new" className="btn btn-primary">
              🎤 Nova Consulta
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

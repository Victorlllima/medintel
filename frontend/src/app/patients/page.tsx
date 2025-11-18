'use client'

import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'
import Link from 'next/link'
import type { Patient } from '@/types'

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['patients', { page, search }],
    queryFn: () => api.getPatients({ page, page_size: 20, search }),
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pacientes</h1>
            <p className="text-neutral-500">Gerencie seus pacientes</p>
          </div>
          <Link href="/patients/new" className="btn btn-primary">
            ➕ Novo Paciente
          </Link>
        </div>

        {/* Search */}
        <div className="card">
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>

        {/* Patients List */}
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
              {data?.patients?.map((patient: Patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="card hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{patient.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span>CPF: {patient.cpf}</span>
                        <span>
                          Nascimento:{' '}
                          {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}
                        </span>
                        {patient.phone && <span>Tel: {patient.phone}</span>}
                      </div>
                      {patient.allergies.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {patient.allergies.map((allergy, i) => (
                            <span key={i} className="badge badge-warning">
                              ⚠️ {allergy}
                            </span>
                          ))}
                        </div>
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

        {!isLoading && (!data?.patients || data.patients.length === 0) && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum paciente encontrado</h3>
            <p className="text-neutral-500 mb-6">
              {search
                ? 'Tente uma busca diferente'
                : 'Comece adicionando seu primeiro paciente'}
            </p>
            {!search && (
              <Link href="/patients/new" className="btn btn-primary">
                ➕ Adicionar Primeiro Paciente
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

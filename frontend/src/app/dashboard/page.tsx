'use client'

import { FileText, Users, Clock, TrendingUp, Plus, Mic, Search } from 'lucide-react'
import { StatCard } from '@/components/Dashboard/StatCard'
import { ConsultationsChart } from '@/components/Dashboard/ConsultationsChart'
import { useDashboardData } from '@/components/Dashboard/useDashboardData'
import { Button } from '@/components/UI/Button'
import Link from 'next/link'

export default function DashboardPage() {
  const { stats, chartData, recentConsultations, isLoading } = useDashboardData()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-neutral-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Visão geral da sua prática médica</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Consultas Hoje"
            value={stats?.consultationsToday || 0}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Consultas Este Mês"
            value={stats?.consultationsMonth || 0}
            icon={TrendingUp}
            color="green"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Pacientes Ativos"
            value={stats?.patientsCount || 0}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Tempo Economizado"
            value={`${stats?.timeSaved || 0}h`}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/consultations/new">
              <Button variant="primary" size="lg" leftIcon={<Mic size={20} />}>
                Nova Consulta
              </Button>
            </Link>
            <Link href="/patients">
              <Button variant="secondary" size="lg" leftIcon={<Plus size={20} />}>
                Novo Paciente
              </Button>
            </Link>
            <Link href="/consultations">
              <Button variant="ghost" size="lg" leftIcon={<Search size={20} />}>
                Buscar Consulta
              </Button>
            </Link>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8">
          <ConsultationsChart data={chartData || []} />
        </div>

        {/* Recent Consultations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Consultas Recentes</h3>

          {recentConsultations && recentConsultations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Paciente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {recentConsultations.map((consultation: any) => (
                    <tr key={consultation.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(consultation.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {consultation.patients.name}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={consultation.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/consultations/${consultation.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
              <p>Nenhuma consulta realizada ainda</p>
              <Link href="/consultations/new">
                <Button variant="primary" className="mt-4" leftIcon={<Plus size={20} />}>
                  Criar Primeira Consulta
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    queued: 'bg-yellow-100 text-yellow-800',
    transcribing: 'bg-blue-100 text-blue-800',
    summarizing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }

  const labels = {
    queued: 'Na fila',
    transcribing: 'Transcrevendo',
    summarizing: 'Resumindo',
    completed: 'Concluída',
    failed: 'Erro'
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

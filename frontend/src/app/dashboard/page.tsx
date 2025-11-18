'use client'

import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/types'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-100 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-100 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-neutral-500">Visão geral da sua prática médica</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Consultas Hoje"
            value={stats?.consultations_today || 0}
            icon="📅"
            color="blue"
          />
          <StatCard
            title="Consultas no Mês"
            value={stats?.consultations_month || 0}
            icon="📊"
            color="green"
          />
          <StatCard
            title="Pacientes Ativos"
            value={stats?.active_patients || 0}
            icon="👥"
            color="purple"
          />
          <StatCard
            title="Total de Pacientes"
            value={stats?.total_patients || 0}
            icon="🏥"
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consultations by Day */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Consultas nos Últimos 7 Dias</h3>
            <div className="space-y-2">
              {stats?.consultations_by_day?.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {new Date(day.date).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-neutral-100 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min((day.count / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top ICDs */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">CIDs Mais Frequentes</h3>
            <div className="space-y-3">
              {stats?.top_icds?.length ? (
                stats.top_icds.map((icd, index) => (
                  <div key={icd.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{icd.code}</span>
                    </div>
                    <span className="badge badge-info">{icd.count}x</span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm">Nenhum dado disponível</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction
              title="Novo Paciente"
              description="Cadastrar um novo paciente"
              icon="➕"
              href="/patients/new"
            />
            <QuickAction
              title="Nova Consulta"
              description="Fazer upload de áudio"
              icon="🎤"
              href="/consultations/new"
            />
            <QuickAction
              title="Buscar"
              description="Buscar consultas anteriores"
              icon="🔍"
              href="/search"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickAction({ title, description, icon, href }: any) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 p-4 rounded-lg border border-neutral-100 hover:border-primary hover:bg-primary/5 transition-colors"
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
    </a>
  )
}

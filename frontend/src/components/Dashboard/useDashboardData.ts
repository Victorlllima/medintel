import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDashboardData() {
  // Stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      const today = new Date().toISOString().split('T')[0]
      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)

      // Consultas hoje
      const { count: consultationsToday } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user?.id)
        .gte('created_at', today)

      // Consultas este mês
      const { count: consultationsMonth } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user?.id)
        .gte('created_at', thisMonthStart.toISOString())

      // Pacientes
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user?.id)

      // Tempo economizado (10min por consulta)
      const timeSaved = Math.round((consultationsMonth || 0) * 10 / 60)

      return {
        consultationsToday,
        consultationsMonth,
        patientsCount,
        timeSaved
      }
    }
  })

  // Chart data (últimos 7 dias)
  const { data: chartData } = useQuery({
    queryKey: ['dashboard-chart'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      const days = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const { count } = await supabase
          .from('consultations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.user?.id)
          .gte('created_at', dateStr)
          .lt('created_at', new Date(date.getTime() + 86400000).toISOString())

        days.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          consultations: count || 0
        })
      }

      return days
    }
  })

  // Recent consultations
  const { data: recentConsultations } = useQuery({
    queryKey: ['recent-consultations'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('consultations')
        .select('id, created_at, status, patients(name)')
        .eq('user_id', user.user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      return data
    }
  })

  return {
    stats,
    chartData,
    recentConsultations,
    isLoading: !stats || !chartData || !recentConsultations
  }
}

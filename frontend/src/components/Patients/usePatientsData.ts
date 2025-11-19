import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export interface Patient {
  id: string
  user_id: string
  name: string
  cpf: string
  date_of_birth: string
  phone?: string
  email?: string
  allergies: string[]
  medical_history?: string
  consent_given: boolean
  consent_date?: string
  created_at: string
  updated_at: string
}

export interface CreatePatientInput {
  name: string
  cpf: string
  date_of_birth: string
  phone?: string
  email?: string
  allergies?: string[]
  medical_history?: string
  consent_given: boolean
}

export function usePatientsData(searchTerm: string = '') {
  const queryClient = useQueryClient()

  // Lista de pacientes com busca
  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()

      let query = supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.user?.id)
        .order('created_at', { ascending: false })

      // Busca por nome ou CPF
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Patient[]
    }
  })

  // Criar paciente
  const createPatient = useMutation({
    mutationFn: async (input: CreatePatientInput) => {
      const { data: user } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('patients')
        .insert({
          ...input,
          user_id: user.user?.id,
          consent_date: input.consent_given ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Paciente cadastrado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cadastrar paciente')
    }
  })

  // Atualizar paciente
  const updatePatient = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Patient> & { id: string }) => {
      const { data, error } = await supabase
        .from('patients')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Paciente atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar paciente')
    }
  })

  // Excluir paciente
  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Paciente excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir paciente')
    }
  })

  return {
    patients,
    isLoading,
    error,
    createPatient,
    updatePatient,
    deletePatient
  }
}

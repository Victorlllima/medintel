'use client'

import { useState, useEffect } from 'react'
import { supabase, type Patient } from '@/lib/supabase'
import { Search, User } from 'lucide-react'

interface PatientSelectorProps {
  selectedPatientId: string | null
  onSelect: (patientId: string) => void
}

export function PatientSelector({
  selectedPatientId,
  onSelect
}: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      setPatients(data || [])
    } catch (err: any) {
      console.error('Error fetching patients:', err)
      setError('Erro ao carregar pacientes')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-neutral-700">
        Selecione o Paciente
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-neutral-500">
          Carregando pacientes...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          {error}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-200">
          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => onSelect(patient.id)}
              className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3 ${
                selectedPatientId === patient.id ? 'bg-blue-50 border-l-4 border-primary' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                <User size={20} className="text-neutral-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">{patient.name}</div>
                {patient.email && (
                  <div className="text-sm text-neutral-500">{patient.email}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedPatient && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
              {selectedPatient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-neutral-900">Paciente Selecionado</div>
              <div className="text-sm text-neutral-600">{selectedPatient.name}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

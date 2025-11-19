'use client'

import { useState } from 'react'
import { usePatientsData } from '@/components/Patients/usePatientsData'
import { PatientForm } from '@/components/Patients/PatientForm'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import { formatCPF, formatPhone } from '@/lib/validations'

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { patients, isLoading, createPatient, deletePatient } = usePatientsData(searchTerm)

  const handleCreatePatient = (data: any) => {
    createPatient.mutate(data, {
      onSuccess: () => setShowForm(false)
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pacientes</h1>
            <p className="text-neutral-600 mt-1">
              {patients?.length || 0} pacientes cadastrados
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
          >
            <Plus size={20} />
            Novo Paciente
          </button>
        </div>

        {/* Busca */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6">Novo Paciente</h2>
              <PatientForm
                onSubmit={handleCreatePatient}
                onCancel={() => setShowForm(false)}
                isLoading={createPatient.isPending}
              />
            </div>
          </div>
        )}

        {/* Lista de Pacientes */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-600">Carregando pacientes...</p>
          </div>
        ) : patients && patients.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">Nome</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">CPF</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">Idade</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">Telefone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">Alergias</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-neutral-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{patient.name}</div>
                      {patient.email && (
                        <div className="text-sm text-neutral-500">{patient.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{formatCPF(patient.cpf)}</td>
                    <td className="px-6 py-4 text-sm">{calculateAge(patient.date_of_birth)} anos</td>
                    <td className="px-6 py-4 text-sm">
                      {patient.phone ? formatPhone(patient.phone) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {patient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.slice(0, 2).map((allergy, i) => (
                            <span key={i} className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                              {allergy}
                            </span>
                          ))}
                          {patient.allergies.length > 2 && (
                            <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                              +{patient.allergies.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">Nenhuma</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-neutral-600 hover:text-primary-500 hover:bg-primary-50 rounded"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja excluir ${patient.name}?`)) {
                              deletePatient.mutate(patient.id)
                            }
                          }}
                          className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-50 rounded"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-neutral-600 mb-4">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
              >
                <Plus size={20} />
                Adicionar Primeiro Paciente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

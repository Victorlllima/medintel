'use client'

import { useState } from 'react'
import { validateCPF, formatCPF, formatPhone } from '@/lib/validations'
import { CreatePatientInput } from './usePatientsData'
import { X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface PatientFormProps {
  onSubmit: (data: CreatePatientInput) => void
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<CreatePatientInput>
}

export function PatientForm({ onSubmit, onCancel, isLoading, initialData }: PatientFormProps) {
  const [formData, setFormData] = useState<CreatePatientInput>({
    name: initialData?.name || '',
    cpf: initialData?.cpf || '',
    date_of_birth: initialData?.date_of_birth || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    allergies: initialData?.allergies || [],
    medical_history: initialData?.medical_history || '',
    consent_given: initialData?.consent_given || false
  })

  const [newAllergy, setNewAllergy] = useState('')
  const [cpfError, setCpfError] = useState('')

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '')
    setFormData({ ...formData, cpf: value })

    if (value.length === 11) {
      if (!validateCPF(value)) {
        setCpfError('CPF inválido')
      } else {
        setCpfError('')
      }
    } else {
      setCpfError('')
    }
  }

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies!, newAllergy.trim()]
      })
      setNewAllergy('')
    }
  }

  const handleRemoveAllergy = (index: number) => {
    setFormData({
      ...formData,
      allergies: formData.allergies!.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!validateCPF(formData.cpf)) {
      toast.error('CPF inválido')
      return
    }

    if (!formData.date_of_birth) {
      toast.error('Data de nascimento é obrigatória')
      return
    }

    if (!formData.consent_given) {
      toast.error('É necessário obter o consentimento do paciente para gravação')
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome Completo */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Nome Completo *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>

      {/* CPF */}
      <div>
        <label className="block text-sm font-medium mb-2">
          CPF *
        </label>
        <input
          type="text"
          value={formatCPF(formData.cpf)}
          onChange={handleCPFChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            cpfError ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="000.000.000-00"
          required
          disabled={isLoading}
        />
        {cpfError && <p className="mt-1 text-sm text-red-500">{cpfError}</p>}
      </div>

      {/* Data de Nascimento */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Data de Nascimento *
        </label>
        <input
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Telefone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="(00) 00000-0000"
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>

      {/* Alergias */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Alergias
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ex: Dipirona, Penicilina..."
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleAddAllergy}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            disabled={isLoading}
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.allergies!.map((allergy, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
            >
              {allergy}
              <button
                type="button"
                onClick={() => handleRemoveAllergy(index)}
                className="hover:text-red-900"
                disabled={isLoading}
              >
                <X size={16} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Histórico Médico */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Histórico Médico
        </label>
        <textarea
          value={formData.medical_history}
          onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Doenças prévias, cirurgias, medicações em uso..."
          disabled={isLoading}
        />
      </div>

      {/* Consentimento */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.consent_given}
            onChange={(e) => setFormData({ ...formData, consent_given: e.target.checked })}
            className="mt-1 w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
            required
            disabled={isLoading}
          />
          <div>
            <p className="font-medium">Consentimento para Gravação *</p>
            <p className="text-sm text-neutral-600 mt-1">
              O paciente está ciente e autoriza a gravação das consultas médicas
              para fins de documentação clínica, conforme Lei Geral de Proteção de Dados (LGPD).
            </p>
          </div>
        </label>
      </div>

      {/* Botões */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50"
          disabled={isLoading || !!cpfError}
        >
          {isLoading ? 'Salvando...' : 'Salvar Paciente'}
        </button>
      </div>
    </form>
  )
}

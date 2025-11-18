'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    crm: '',
    specialty: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            crm: formData.crm,
            specialty: formData.specialty || null,
          })

        if (profileError) throw profileError
      }

      toast.success('Conta criada com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 py-12">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Criar Conta</h1>
            <p className="text-neutral-500">Comece a automatizar sua documentação</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-2">
                Nome Completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className="input"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="crm" className="block text-sm font-medium mb-2">
                CRM
              </label>
              <input
                id="crm"
                name="crm"
                type="text"
                value={formData.crm}
                onChange={handleChange}
                className="input"
                placeholder="12345/SP"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium mb-2">
                Especialidade (opcional)
              </label>
              <input
                id="specialty"
                name="specialty"
                type="text"
                value={formData.specialty}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Cardiologia"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha (mínimo 8 caracteres)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-neutral-500">Já tem uma conta? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async setToken() {
    const { data: { session } } = await supabase.auth.getSession()
    this.token = session?.access_token || null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.setToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Request failed')
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    return this.request('/api/auth/login', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  }

  async register(data: {
    email: string
    password: string
    full_name: string
    crm: string
    specialty?: string
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile() {
    return this.request('/api/auth/me')
  }

  async updateProfile(data: any) {
    return this.request('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Patients
  async getPatients(params?: { page?: number; page_size?: number; search?: string }) {
    const queryParams = new URLSearchParams(params as any).toString()
    return this.request(`/api/patients?${queryParams}`)
  }

  async getPatient(id: string) {
    return this.request(`/api/patients/${id}`)
  }

  async createPatient(data: any) {
    return this.request('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePatient(id: string, data: any) {
    return this.request(`/api/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deletePatient(id: string) {
    return this.request(`/api/patients/${id}`, {
      method: 'DELETE',
    })
  }

  // Consultations
  async uploadConsultation(patientId: string, audioFile: File) {
    await this.setToken()

    const formData = new FormData()
    formData.append('patient_id', patientId)
    formData.append('audio_file', audioFile)

    const response = await fetch(`${this.baseURL}/api/consultations/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }

  async getConsultations(params?: any) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/api/consultations?${queryParams}`)
  }

  async getConsultation(id: string) {
    return this.request(`/api/consultations/${id}`)
  }

  async updateConsultation(id: string, data: any) {
    return this.request(`/api/consultations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Documents
  async generateDocument(data: any) {
    return this.request('/api/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getDocuments(params?: any) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/api/documents?${queryParams}`)
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/dashboard/stats')
  }

  // Search
  async searchConsultations(query: string, params?: any) {
    const queryParams = new URLSearchParams({ query, ...params }).toString()
    return this.request(`/api/search/consultations?${queryParams}`)
  }
}

export const api = new ApiClient(API_URL)

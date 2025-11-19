import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface Patient {
  id: string
  name: string
  email?: string
  phone?: string
  created_at: string
}

export interface Consultation {
  id: string
  patient_id: string
  user_id: string
  audio_url: string
  duration: number
  status: 'queued' | 'processing' | 'completed' | 'failed'
  transcription?: string
  created_at: string
}

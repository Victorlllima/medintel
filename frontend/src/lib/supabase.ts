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

export interface TranscriptionSegment {
  text: string
  start: number
  end: number
  confidence?: number
}

export interface Summary {
  chief_complaint?: string
  hda?: string
  physical_exam?: string
  assessment?: string
  plan?: string
}

export interface ICDSuggestion {
  code: string
  description: string
  confidence: number
}

export interface Consultation {
  id: string
  patient_id: string
  user_id: string
  audio_url: string
  duration: number
  status: 'queued' | 'processing' | 'completed' | 'failed'
  transcription?: string
  transcription_segments?: TranscriptionSegment[]
  summary?: Summary
  icd_suggestions?: ICDSuggestion[]
  icd_codes?: string[]
  error_message?: string
  created_at: string
  updated_at?: string
  completed_at?: string
}

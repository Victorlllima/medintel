import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          crm: string
          specialty: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          crm: string
          specialty?: string | null
        }
        Update: {
          full_name?: string
          crm?: string
          specialty?: string | null
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          name: string
          cpf: string
          date_of_birth: string
          phone: string | null
          email: string | null
          allergies: string[]
          medical_history: string | null
          consent_given: boolean
          consent_date: string
          created_at: string
          updated_at: string | null
        }
      }
      consultations: {
        Row: {
          id: string
          patient_id: string
          user_id: string
          audio_url: string
          duration: number | null
          status: string
          transcription: string | null
          transcription_segments: any | null
          summary: any | null
          icd_suggestions: any | null
          icd_codes: string[]
          error_message: string | null
          created_at: string
          updated_at: string | null
          completed_at: string | null
        }
      }
      documents: {
        Row: {
          id: string
          consultation_id: string
          patient_id: string
          user_id: string
          document_type: string
          format: string
          file_url: string
          data: any
          created_at: string
        }
      }
    }
  }
}

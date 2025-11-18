export interface User {
  id: string
  email: string
  full_name: string
  crm: string
  specialty?: string
  created_at: string
  updated_at?: string
}

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
  consent_date: string
  created_at: string
  updated_at?: string
}

export interface Consultation {
  id: string
  patient_id: string
  user_id: string
  audio_url: string
  duration?: number
  status: ConsultationStatus
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

export enum ConsultationStatus {
  UPLOADING = 'uploading',
  QUEUED = 'queued',
  TRANSCRIBING = 'transcribing',
  SUMMARIZING = 'summarizing',
  COMPLETED = 'completed',
  FAILED = 'failed',
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

export interface Document {
  id: string
  consultation_id: string
  patient_id: string
  user_id: string
  document_type: DocumentType
  format: DocumentFormat
  file_url: string
  data: any
  created_at: string
}

export enum DocumentType {
  MEDICAL_CERTIFICATE = 'medical_certificate',
  PRESCRIPTION = 'prescription',
  ATTENDANCE_DECLARATION = 'attendance_declaration',
}

export enum DocumentFormat {
  PDF = 'pdf',
  DOCX = 'docx',
}

export interface DashboardStats {
  consultations_today: number
  consultations_month: number
  active_patients: number
  total_patients: number
  avg_consultation_duration: number
  top_icds: { code: string; count: number }[]
  consultations_by_day: { date: string; count: number }[]
}

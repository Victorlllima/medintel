export type ConsultationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CID10Suggestion {
  code: string;
  description: string;
  confidence?: number;
}

export interface Consultation {
  id: string;
  patient_name: string;
  consultation_date: string;
  audio_duration?: number;
  status: ConsultationStatus;
  audio_url?: string;
  transcription?: string;
  summary?: string;
  cid10_suggestions?: CID10Suggestion[];
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface CreateConsultationDto {
  patient_name: string;
  consultation_date: string;
  audio_file: File;
}

export interface GenerateDocumentDto {
  consultation_id: string;
  document_type: 'atestado' | 'receita' | 'declaracao';
}

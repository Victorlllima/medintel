import { Consultation } from '@/types/consultation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new ApiError(response.status, error.message || 'Erro na requisição');
  }
  return response.json();
}

export const api = {
  consultations: {
    getAll: async (): Promise<Consultation[]> => {
      const response = await fetch(`${API_URL}/api/consultations`);
      return handleResponse<Consultation[]>(response);
    },

    getById: async (id: string): Promise<Consultation> => {
      const response = await fetch(`${API_URL}/api/consultations/${id}`);
      return handleResponse<Consultation>(response);
    },

    create: async (data: FormData): Promise<Consultation> => {
      const response = await fetch(`${API_URL}/api/consultations`, {
        method: 'POST',
        body: data,
      });
      return handleResponse<Consultation>(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/api/consultations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new ApiError(response.status, 'Erro ao excluir consulta');
      }
    },

    reprocess: async (id: string): Promise<Consultation> => {
      const response = await fetch(`${API_URL}/api/consultations/${id}/reprocess`, {
        method: 'POST',
      });
      return handleResponse<Consultation>(response);
    },
  },

  documents: {
    generate: async (consultationId: string, documentType: string): Promise<Blob> => {
      const response = await fetch(
        `${API_URL}/api/consultations/${consultationId}/documents/${documentType}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new ApiError(response.status, 'Erro ao gerar documento');
      }

      return response.blob();
    },
  },
};

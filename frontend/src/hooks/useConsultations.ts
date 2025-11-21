import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Consultation } from '@/types/consultation';

export function useConsultations() {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: api.consultations.getAll,
  });
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: ['consultations', id],
    queryFn: () => api.consultations.getById(id),
    enabled: !!id,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.consultations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

export function useDeleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.consultations.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

export function useReprocessConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.consultations.reprocess,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultations', data.id] });
    },
  });
}

export function useGenerateDocument() {
  return useMutation({
    mutationFn: ({ consultationId, documentType }: { consultationId: string; documentType: string }) =>
      api.documents.generate(consultationId, documentType),
    onSuccess: (blob, variables) => {
      // Download the document
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${variables.documentType}-${variables.consultationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

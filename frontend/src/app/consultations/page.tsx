'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConsultations } from '@/hooks/useConsultations';
import { ConsultationDetails } from '@/components/consultations/ConsultationDetails';
import { formatDate, formatDuration, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Plus, Loader2, AlertCircle, Calendar, Clock } from 'lucide-react';

export default function ConsultationsPage() {
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: consultations, isLoading, error } = useConsultations();

  const handleConsultationClick = (consultationId: string) => {
    setSelectedConsultationId(consultationId);
    setDetailsOpen(true);
  };

  const handleDetailsClose = (open: boolean) => {
    setDetailsOpen(open);
    if (!open) {
      setSelectedConsultationId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Erro ao carregar consultas</h2>
          <p className="text-muted-foreground mt-2">
            Não foi possível carregar a lista de consultas. Tente novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Consultas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e visualize todas as suas consultas médicas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {consultations && consultations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-lg font-medium">Nenhuma consulta encontrada</p>
              <p className="text-sm text-muted-foreground mt-2">
                Comece criando sua primeira consulta
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Consulta
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {consultations?.map((consultation) => (
            <Card
              key={consultation.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleConsultationClick(consultation.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{consultation.patient_name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(consultation.consultation_date)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(consultation.status)}>
                    {getStatusLabel(consultation.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {consultation.audio_duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Duração: {formatDuration(consultation.audio_duration)}</span>
                    </div>
                  )}

                  {consultation.status === 'completed' && (
                    <div className="pt-2 space-y-1">
                      {consultation.transcription && (
                        <p className="text-xs text-muted-foreground">✓ Transcrição disponível</p>
                      )}
                      {consultation.summary && (
                        <p className="text-xs text-muted-foreground">✓ Resumo disponível</p>
                      )}
                      {consultation.cid10_suggestions &&
                        consultation.cid10_suggestions.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ✓ {consultation.cid10_suggestions.length} sugestões de CID-10
                          </p>
                        )}
                    </div>
                  )}

                  {consultation.status === 'processing' && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processando...</span>
                    </div>
                  )}

                  {consultation.status === 'failed' && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>Falha no processamento</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConsultationDetails
        consultationId={selectedConsultationId}
        open={detailsOpen}
        onOpenChange={handleDetailsClose}
      />
    </div>
  );
}

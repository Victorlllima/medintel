'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useConsultation,
  useDeleteConsultation,
  useReprocessConsultation,
  useGenerateDocument,
} from '@/hooks/useConsultations';
import { formatDate, formatDuration, getStatusColor, getStatusLabel } from '@/lib/utils';
import {
  FileText,
  Pill,
  FileCheck,
  Trash2,
  RefreshCw,
  Play,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ConsultationDetailsProps {
  consultationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsultationDetails({
  consultationId,
  open,
  onOpenChange,
}: ConsultationDetailsProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: consultation, isLoading, error } = useConsultation(consultationId || '');
  const deleteMutation = useDeleteConsultation();
  const reprocessMutation = useReprocessConsultation();
  const generateDocMutation = useGenerateDocument();

  const handleDelete = async () => {
    if (!consultation) return;

    if (confirm('Tem certeza que deseja excluir esta consulta?')) {
      try {
        await deleteMutation.mutateAsync(consultation.id);
        toast({
          title: 'Sucesso',
          description: 'Consulta excluída com sucesso',
        });
        onOpenChange(false);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao excluir consulta',
          variant: 'destructive',
        });
      }
    }
  };

  const handleReprocess = async () => {
    if (!consultation) return;

    try {
      await reprocessMutation.mutateAsync(consultation.id);
      toast({
        title: 'Sucesso',
        description: 'Consulta sendo reprocessada',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao reprocessar consulta',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateDocument = async (documentType: string) => {
    if (!consultation) return;

    try {
      await generateDocMutation.mutateAsync({
        consultationId: consultation.id,
        documentType,
      });
      toast({
        title: 'Sucesso',
        description: 'Documento gerado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar documento',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !consultation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold">Erro ao carregar consulta</p>
            <p className="text-sm text-muted-foreground mt-2">
              Não foi possível carregar os detalhes da consulta
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{consultation.patient_name}</DialogTitle>
              <DialogDescription className="mt-2">
                {formatDate(consultation.consultation_date)}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(consultation.status)}>
              {getStatusLabel(consultation.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Audio Player */}
          {consultation.audio_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Áudio da Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <audio
                    controls
                    className="w-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={consultation.audio_url} type="audio/mpeg" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                  {consultation.audio_duration && (
                    <p className="text-sm text-muted-foreground">
                      Duração: {formatDuration(consultation.audio_duration)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {consultation.status === 'failed' && consultation.error_message && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Erro no Processamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{consultation.error_message}</p>
                <Button
                  onClick={handleReprocess}
                  disabled={reprocessMutation.isPending}
                  className="mt-4"
                  variant="outline"
                >
                  {reprocessMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reprocessando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reprocessar Consulta
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Processing Status */}
          {consultation.status === 'processing' && (
            <Card className="border-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <p className="text-sm">
                    A consulta está sendo processada. Os resultados aparecerão em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transcription */}
          {consultation.transcription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transcrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {consultation.transcription}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {consultation.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Estruturado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {consultation.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* CID-10 Suggestions */}
          {consultation.cid10_suggestions && consultation.cid10_suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sugestões de CID-10</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consultation.cid10_suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Badge variant="outline" className="mt-0.5">
                        {suggestion.code}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{suggestion.description}</p>
                        {suggestion.confidence && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Confiança: {(suggestion.confidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {consultation.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gerar Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleGenerateDocument('atestado')}
                    disabled={generateDocMutation.isPending}
                    variant="outline"
                  >
                    {generateDocMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Atestado Médico
                  </Button>
                  <Button
                    onClick={() => handleGenerateDocument('receita')}
                    disabled={generateDocMutation.isPending}
                    variant="outline"
                  >
                    {generateDocMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Pill className="mr-2 h-4 w-4" />
                    )}
                    Receita
                  </Button>
                  <Button
                    onClick={() => handleGenerateDocument('declaracao')}
                    disabled={generateDocMutation.isPending}
                    variant="outline"
                  >
                    {generateDocMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileCheck className="mr-2 h-4 w-4" />
                    )}
                    Declaração de Comparecimento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              variant="destructive"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Consulta
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import { documentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const DocumentList = ({ consultationId, refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [consultationId, refreshTrigger]);

  const loadDocuments = async () => {
    if (!consultationId) return;

    try {
      setLoading(true);
      const docs = await documentsAPI.getByConsultation(consultationId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      await documentsAPI.delete(documentId);
      toast.success('Documento excluído com sucesso');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      medical_certificate: 'Atestado Médico',
      prescription: 'Receita Médica',
      attendance_declaration: 'Declaração de Comparecimento',
    };
    return labels[type] || type;
  };

  const getDocumentIcon = (type) => {
    const icons = {
      medical_certificate: '📄',
      prescription: '💊',
      attendance_declaration: '✅',
    };
    return icons[type] || '📄';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum documento gerado ainda
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Documentos Gerados</h3>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">{getDocumentIcon(doc.document_type)}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {doc.document_title || getDocumentTypeLabel(doc.document_type)}
                </div>
                <div className="text-sm text-gray-500">
                  Gerado em {formatDate(doc.created_at)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Baixar
              </a>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
              >
                Visualizar
              </a>
              <button
                onClick={() => handleDelete(doc.id)}
                className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;

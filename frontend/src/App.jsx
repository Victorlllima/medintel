import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import DocumentGenerator from './components/DocumentGenerator';
import DocumentList from './components/DocumentList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Mock consultation data - in production, this would come from props or context
  const mockConsultation = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    consultation_date: new Date().toISOString(),
    patient_id: '987f6543-e21a-09b8-c765-432109876543',
  };

  const handleDocumentGenerated = (document) => {
    // Trigger refresh of document list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            MedIntel - Sistema de Documentos Médicos
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Bem-vindo ao Sistema de Geração de Documentos
            </h2>
            <p className="text-blue-800">
              Gere atestados médicos, receitas e declarações de comparecimento com facilidade.
              Todos os documentos são gerados em PDF e armazenados de forma segura.
            </p>
          </div>

          {/* Document Generator */}
          <div className="bg-white rounded-lg shadow p-6">
            <DocumentGenerator
              consultation={mockConsultation}
              onDocumentGenerated={handleDocumentGenerated}
            />
          </div>

          {/* Document List */}
          <div className="bg-white rounded-lg shadow p-6">
            <DocumentList
              consultationId={mockConsultation.id}
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Como usar
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Clique no tipo de documento que deseja gerar</li>
              <li>Preencha os dados necessários no formulário</li>
              <li>Clique em "Gerar Documento"</li>
              <li>O documento será gerado e aparecerá na lista abaixo</li>
              <li>Você pode visualizar, baixar ou excluir os documentos gerados</li>
            </ol>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            MedIntel - Sistema de Gerenciamento de Documentos Médicos
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

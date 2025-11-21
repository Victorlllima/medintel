'use client';

import { useState } from 'react';
import AudioRecorder from '@/components/AudioRecorder';

interface Recording {
  id: string;
  audioUrl: string;
  audioBlob: Blob;
  timestamp: Date;
  duration: number;
}

export default function ConsultationsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [showRecorder, setShowRecorder] = useState(false);

  const handleRecordingComplete = (audioBlob: Blob, audioUrl: string) => {
    const newRecording: Recording = {
      id: Date.now().toString(),
      audioUrl,
      audioBlob,
      timestamp: new Date(),
      duration: 0, // Você pode calcular a duração se necessário
    };

    setRecordings([newRecording, ...recordings]);
    setShowRecorder(false);
  };

  const deleteRecording = (id: string) => {
    setRecordings(recordings.filter(r => r.id !== id));
  };

  const downloadRecording = (recording: Recording) => {
    const a = document.createElement('a');
    a.href = recording.audioUrl;
    a.download = `consulta-${recording.timestamp.toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            MedIntel - Gravação de Consultas
          </h1>
          <p className="text-gray-600">
            Sistema inteligente de gravação com visualização em tempo real
          </p>
        </header>

        {/* Botão de nova gravação */}
        {!showRecorder && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowRecorder(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
              </svg>
              Nova Gravação
            </button>
          </div>
        )}

        {/* Componente de gravação */}
        {showRecorder && (
          <div className="mb-8">
            <div className="mb-4">
              <button
                onClick={() => setShowRecorder(false)}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Voltar
              </button>
            </div>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        )}

        {/* Lista de gravações */}
        {recordings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Gravações Recentes ({recordings.length})
            </h2>

            <div className="space-y-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Consulta - {recording.timestamp.toLocaleDateString('pt-BR')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {recording.timestamp.toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadRecording(recording)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Baixar
                      </button>
                      <button
                        onClick={() => deleteRecording(recording.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </div>

                  {/* Player de áudio */}
                  <audio
                    controls
                    src={recording.audioUrl}
                    className="w-full"
                    controlsList="nodownload"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há gravações */}
        {recordings.length === 0 && !showRecorder && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma gravação ainda
            </h3>
            <p className="text-gray-500">
              Clique em "Nova Gravação" para começar a gravar uma consulta
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

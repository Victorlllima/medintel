import React, { useState } from 'react';
import { documentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const DocumentGenerator = ({ consultation, onDocumentGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});

  const documentTypes = [
    {
      type: 'medical_certificate',
      label: 'Atestado Médico',
      icon: '📄',
      fields: [
        { name: 'days_off', label: 'Dias de afastamento', type: 'number', required: true, min: 1 },
        { name: 'cid10', label: 'CID-10 (opcional)', type: 'text', required: false },
        { name: 'notes', label: 'Observações', type: 'textarea', required: false },
      ],
    },
    {
      type: 'prescription',
      label: 'Receita Médica',
      icon: '💊',
      fields: [
        { name: 'medications', label: 'Medicamentos', type: 'medications', required: true },
        { name: 'instructions', label: 'Orientações gerais', type: 'textarea', required: false },
        { name: 'validity_days', label: 'Validade (dias)', type: 'number', required: false, default: 30 },
      ],
    },
    {
      type: 'attendance_declaration',
      label: 'Declaração de Comparecimento',
      icon: '✅',
      fields: [
        { name: 'start_time', label: 'Hora de início (HH:MM)', type: 'time', required: true },
        { name: 'end_time', label: 'Hora de término (HH:MM)', type: 'time', required: false },
        { name: 'duration_minutes', label: 'Duração (minutos)', type: 'number', required: true, default: 30 },
      ],
    },
  ];

  const openModal = (type) => {
    setSelectedType(type);
    setShowModal(true);

    // Initialize form data with defaults
    const typeConfig = documentTypes.find(t => t.type === type);
    const initialData = {};
    typeConfig.fields.forEach(field => {
      if (field.default) {
        initialData[field.name] = field.default;
      }
    });
    setFormData(initialData);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedType(null);
    setFormData({});
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationsChange = (medications) => {
    setFormData(prev => ({
      ...prev,
      medications
    }));
  };

  const handleGenerate = async () => {
    if (!consultation?.id) {
      toast.error('Consulta não encontrada');
      return;
    }

    try {
      setIsGenerating(true);

      const payload = {
        consultation_id: consultation.id,
        document_type: selectedType,
        additional_data: formData
      };

      const document = await documentsAPI.generate(payload);

      toast.success('Documento gerado com sucesso!');
      closeModal();

      if (onDocumentGenerated) {
        onDocumentGenerated(document);
      }

    } catch (error) {
      console.error('Error generating document:', error);
      toast.error(error.response?.data?.detail || 'Erro ao gerar documento');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderField = (field) => {
    if (field.type === 'medications') {
      return <MedicationsInput onChange={handleMedicationsChange} />;
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          value={formData[field.name] || ''}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          required={field.required}
        />
      );
    }

    return (
      <input
        type={field.type}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={formData[field.name] || ''}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        required={field.required}
        min={field.min}
      />
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Gerar Documentos</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documentTypes.map((docType) => (
          <button
            key={docType.type}
            onClick={() => openModal(docType.type)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">{docType.icon}</div>
            <div className="font-medium text-gray-800">{docType.label}</div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {documentTypes.find(t => t.type === selectedType)?.label}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {documentTypes.find(t => t.type === selectedType)?.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isGenerating}
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Documento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Medications Input Component
const MedicationsInput = ({ onChange }) => {
  const [medications, setMedications] = useState([
    { name: '', dosage: '', instructions: '', duration: '' }
  ]);

  const addMedication = () => {
    const newMeds = [...medications, { name: '', dosage: '', instructions: '', duration: '' }];
    setMedications(newMeds);
    onChange(newMeds);
  };

  const removeMedication = (index) => {
    const newMeds = medications.filter((_, i) => i !== index);
    setMedications(newMeds);
    onChange(newMeds);
  };

  const updateMedication = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
    onChange(newMeds);
  };

  return (
    <div className="space-y-3">
      {medications.map((med, index) => (
        <div key={index} className="p-3 border border-gray-200 rounded-md space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Medicamento {index + 1}</span>
            {medications.length > 1 && (
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remover
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Nome do medicamento"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={med.name}
            onChange={(e) => updateMedication(index, 'name', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Dosagem (ex: 500mg)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={med.dosage}
              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
            />
            <input
              type="text"
              placeholder="Duração"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={med.duration}
              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
            />
          </div>

          <input
            type="text"
            placeholder="Posologia (ex: 1 comprimido a cada 8 horas)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={med.instructions}
            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addMedication}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 text-sm text-gray-600 hover:text-blue-600"
      >
        + Adicionar medicamento
      </button>
    </div>
  );
};

export default DocumentGenerator;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Documents API
export const documentsAPI = {
  generate: async (data) => {
    const response = await api.post('/documents/generate', data);
    return response.data;
  },

  list: async (consultationId) => {
    const params = consultationId ? { consultation_id: consultationId } : {};
    const response = await api.get('/documents', { params });
    return response.data;
  },

  getByConsultation: async (consultationId) => {
    const response = await api.get(`/documents/consultation/${consultationId}`);
    return response.data;
  },

  get: async (documentId) => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  },

  delete: async (documentId) => {
    await api.delete(`/documents/${documentId}`);
  },
};

export default api;

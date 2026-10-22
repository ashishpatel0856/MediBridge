import api from './api';

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data),
  getByConsultation: (consultationId) => api.get(`/prescriptions/${consultationId}`),
  verify: (data) => api.post('/prescriptions/verify', data),
};

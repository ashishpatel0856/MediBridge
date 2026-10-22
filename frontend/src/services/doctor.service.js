import api from './api';

export const doctorService = {
  search: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  updateProfile: (data) => api.put('/doctors/profile', data),
  verify: (id) => api.patch(`/doctors/${id}/verify`),
};

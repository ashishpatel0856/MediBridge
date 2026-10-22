import api from './api';

export const authService = {
  registerPatient: (data) => api.post('/auth/register/patient', data),
  registerDoctor: (data) => api.post('/auth/register/doctor', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  setupMfa: () => api.post('/auth/mfa/setup'),
  verifyMfa: (data) => api.post('/auth/mfa/verify', data),
  getMe: () => api.get('/auth/me'),
};

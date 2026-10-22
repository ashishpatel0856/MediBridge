import api from './api';

export const slotService = {
  getSlots: (params) => api.get('/slots', { params }),
  createSlots: (slots) => api.post('/slots', { slots }),
};

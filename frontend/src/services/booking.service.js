import api from './api';

export const bookingService = {
  book: (data, idempotencyKey) =>
    api.post('/bookings/book', data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  confirmPayment: (paymentIntentId) =>
    api.post('/bookings/confirm-payment', { paymentIntentId }),
  getMyBookings: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

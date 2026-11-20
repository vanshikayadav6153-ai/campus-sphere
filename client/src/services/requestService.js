import api from './api';

export const requestService = {
  // POST /api/requests
  createRequest: async (data) => {
    const res = await api.post('/api/requests', data);
    return res.data;
  },

  // GET /api/requests/mine?role=incoming|outgoing
  getMyRequests: async (role = '') => {
    const res = await api.get('/api/requests/mine', { params: { role } });
    return res.data;
  },

  // PATCH /api/requests/:id/accept
  acceptRequest: async (id) => {
    const res = await api.patch(`/api/requests/${id}/accept`);
    return res.data;
  },

  // PATCH /api/requests/:id/reject
  rejectRequest: async (id) => {
    const res = await api.patch(`/api/requests/${id}/reject`);
    return res.data;
  },

  // PATCH /api/requests/:id/cancel
  cancelRequest: async (id) => {
    const res = await api.patch(`/api/requests/${id}/cancel`);
    return res.data;
  },

  // PATCH /api/requests/:id/confirm
  confirmRequest: async (id) => {
    const res = await api.patch(`/api/requests/${id}/confirm`);
    return res.data;
  },
};

export default requestService;

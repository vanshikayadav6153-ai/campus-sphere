import api from './api';

export const statsService = {
  // GET /api/stats/public (No auth, cached 60s)
  getPublicStats: async () => {
    const res = await api.get('/api/stats/public');
    return res.data;
  },

  // GET /api/stats/me (Protected)
  getMyStats: async () => {
    const res = await api.get('/api/stats/me');
    return res.data;
  },
};

export default statsService;

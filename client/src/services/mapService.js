import api from './api';

export const mapService = {
  // GET /api/safezones/stats
  getStats: async () => {
    const res = await api.get('/api/safezones/stats');
    return res.data;
  },

  // GET /api/safezones/:id/listings
  getZoneListings: async (id) => {
    const res = await api.get(`/api/safezones/${id}/listings`);
    return res.data;
  },
};

export default mapService;

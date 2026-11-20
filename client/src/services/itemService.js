import api from './api';

export const itemService = {
  // GET /api/items with filters (q, category, type, safeZone, status)
  getItems: async (params = {}) => {
    const res = await api.get('/api/items', { params });
    return res.data;
  },

  // GET /api/items/mine (seller's listings)
  getMyItems: async () => {
    const res = await api.get('/api/items/mine');
    return res.data;
  },

  // GET /api/items/:id
  getItemById: async (id) => {
    const res = await api.get(`/api/items/${id}`);
    return res.data;
  },

  // POST /api/items
  createItem: async (data) => {
    const res = await api.post('/api/items', data);
    return res.data;
  },

  // PUT /api/items/:id
  updateItem: async (id, data) => {
    const res = await api.put(`/api/items/${id}`, data);
    return res.data;
  },

  // DELETE /api/items/:id
  deleteItem: async (id) => {
    const res = await api.delete(`/api/items/${id}`);
    return res.data;
  },

  // PATCH /api/items/:id/status { status } -> Available | Reserved | Sold
  updateItemStatus: async (id, status) => {
    const res = await api.patch(`/api/items/${id}/status`, { status });
    return res.data;
  },
};

export default itemService;

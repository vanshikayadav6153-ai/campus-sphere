import api from './api';

export const skillService = {
  // Fetch skills with query params: q, kind, category, mode, page, limit
  getSkills: async (params = {}) => {
    const res = await api.get('/api/skills', { params });
    return res.data;
  },

  // Fetch logged in user's skills
  getMySkills: async () => {
    const res = await api.get('/api/skills/mine');
    return res.data;
  },

  // Fetch single skill by id
  getSkillById: async (id) => {
    const res = await api.get(`/api/skills/${id}`);
    return res.data;
  },

  // Create skill listing
  createSkill: async (data) => {
    const res = await api.post('/api/skills', data);
    return res.data;
  },

  // Update skill listing (owner only)
  updateSkill: async (id, data) => {
    const res = await api.put(`/api/skills/${id}`, data);
    return res.data;
  },

  // Delete skill listing (owner only)
  deleteSkill: async (id) => {
    const res = await api.delete(`/api/skills/${id}`);
    return res.data;
  },

  // Get active campus safe zones
  getSafeZones: async () => {
    const res = await api.get('/api/safezones');
    return res.data;
  },
};

export default skillService;

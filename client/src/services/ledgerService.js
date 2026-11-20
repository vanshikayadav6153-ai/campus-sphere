import api from './api';

export const ledgerService = {
  // GET /api/ledger/mine
  getMyLedger: async (page = 1, limit = 10) => {
    const res = await api.get('/api/ledger/mine', { params: { page, limit } });
    return res.data;
  },

  // GET /api/ledger/summary
  getSummary: async () => {
    const res = await api.get('/api/ledger/summary');
    return res.data;
  },
};

export default ledgerService;

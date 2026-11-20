import axios from 'axios';

// Single API Base definition (Render proxy in prod, localhost:5000 in dev)
export const API = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present (ensures auth works across ports/domains)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

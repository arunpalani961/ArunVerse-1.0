import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '');

if (!API_BASE) {
  throw new Error('VITE_API_URL must be set for production builds');
}

const api = axios.create({
  baseURL: API_BASE.replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

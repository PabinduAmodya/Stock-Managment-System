import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ─── Request interceptor: attach JWT token to every request ──────────────────
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('sm.auth.user');
  if (raw) {
    try {
      const authUser = JSON.parse(raw);
      if (authUser?.token) {
        config.headers['Authorization'] = `Bearer ${authUser.token}`;
      }
    } catch {
      // ignore malformed storage
    }
  }
  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────
// ONLY redirect to login on 401 (expired / missing token).
// 403 means the token is valid but the role lacks permission — do NOT logout,
// just let the component handle the error message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sm.auth.user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // In a real app, you might use next-auth or a similar provider.
    // For this MVP, if token is stored in localStorage:
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to /login on 401 for auth-verification endpoints (e.g. /auth/me).
    // Background data-fetch calls (analytics, products, inventory, etc.) already
    // handle 401 gracefully with .catch(), so we must NOT redirect for those
    // or else the dashboard will bounce to login immediately.
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const url = error.config?.url || '';
      const isAuthVerify = url.includes('/auth/me');
      const isAlreadyOnAuth =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register') ||
        window.location.pathname.startsWith('/forgot-password');

      if (isAuthVerify && !isAlreadyOnAuth) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

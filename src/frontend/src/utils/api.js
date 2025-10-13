import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Update if backend runs elsewhere


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Ensure credentials are included
});

// Add a request interceptor to include JWT token if present
api.interceptors.request.use(
  config => {
    const user = localStorage.getItem('user');
    const hasAuthHeader = config?.headers?.Authorization || config?.headers?.authorization;
    if (user && !hasAuthHeader) {
      const token = JSON.parse(user).token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
// Global response interceptor for auth and plan errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    if (status === 401) {
      // Session expired or invalid token
      try {
        const current = window.location.pathname + window.location.search;
        localStorage.removeItem('user');
        // best-effort redirect to login preserving intended next path
        if (!current.startsWith('/login')) {
          window.location.href = `/login?next=${encodeURIComponent(current)}`;
        }
      } catch (_) {
        // noop in non-browser contexts
      }
    }
    // Let caller handle 403 to show upgrade message; include server detail
    return Promise.reject(error?.response ? error : new Error(detail || 'Request failed'));
  }
);

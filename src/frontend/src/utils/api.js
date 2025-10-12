import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Update if backend runs elsewhere


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add a request interceptor to include JWT token if present
api.interceptors.request.use(
  config => {
    const user = localStorage.getItem('user');
    if (user) {
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

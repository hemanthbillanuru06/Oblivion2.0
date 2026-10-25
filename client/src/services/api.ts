import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('oblivion_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired, clear local storage
      if (localStorage.getItem('oblivion_token')) {
        console.warn('Session expired or unauthorized. Logging out.');
        localStorage.removeItem('oblivion_token');
        localStorage.removeItem('oblivion_user');
      }
    }
    return Promise.reject(error);
  }
);

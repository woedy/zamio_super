import axios from 'axios';
import { baseUrl } from '../constants';
import { clearStationId } from './auth';

const env = (import.meta as any)?.env ?? {};

const resolveBaseUrl = (): string => {
  const candidate = env.VITE_API_BASE || env.VITE_API_URL || baseUrl || '/';
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate;
  }
  return '/';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
});

// Attach auth token from storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Token ${token}`;
  }
  return config;
});

// Global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        clearStationId();
        localStorage.removeItem('user_id');
      } catch {}
      if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in') {
        window.location.replace('/sign-in');
      }
    }
    return Promise.reject(error);
  }
);

export default api;


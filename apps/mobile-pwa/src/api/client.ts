import axios from 'axios';

const API_BASE = 'https://trans-bygagoos-api.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('chauffeur-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE };

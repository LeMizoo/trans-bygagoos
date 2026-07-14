import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://trans-bygagoos-api.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function removeAuthToken() {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
}

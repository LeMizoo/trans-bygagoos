import { create } from 'zustand';
import axios from 'axios';

const API = "https://trans-bygagoos.onrender.com/api/v1";

interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem('admin-user') || 'null'),
  token: localStorage.getItem('token'),
  login: async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('admin-user', JSON.stringify(data.user));
    set({ user: data.user, token: data.accessToken });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin-user');
    set({ user: null, token: null });
  },
}));

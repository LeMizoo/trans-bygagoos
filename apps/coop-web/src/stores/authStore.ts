import { create } from 'zustand';
import { api, setAuthToken, removeAuthToken } from '../api/client';

interface User {
  id: string;
  email: string;
  nom: string;
  telephone?: string;
  role: string;
  coopId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      set({ user, token, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    removeAuthToken();
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

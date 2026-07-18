import { create } from 'zustand';

const API = import.meta.env.VITE_API_URL || 'https://trans-bygagoos-api.onrender.com';

interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
  flotteId?: string;
  flotte?: { id: string; nom: string };
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  login: async (email, password) => {
    const { data } = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(res => res.json());
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, token: data.accessToken });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

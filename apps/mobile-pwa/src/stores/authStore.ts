import { create } from 'zustand';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

interface AuthStore {
  chauffeur: any;
  token: string | null;
  moto: any;
  login: (codeAcces: string, pin: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  chauffeur: JSON.parse(localStorage.getItem('chauffeur') || 'null'),
  token: localStorage.getItem('chauffeur-token'),
  moto: JSON.parse(localStorage.getItem('moto') || 'null'),

  login: async (codeAcces, pin) => {
    const { data } = await axios.post(`${API}/auth/chauffeur/login`, { codeAcces, pin });
    localStorage.setItem('chauffeur-token', data.accessToken);
    localStorage.setItem('chauffeur', JSON.stringify(data.chauffeur));
    if (data.chauffeur?.moto) localStorage.setItem('moto', JSON.stringify(data.chauffeur.moto));
    set({ chauffeur: data.chauffeur, token: data.accessToken, moto: data.chauffeur?.moto || null });
  },

  logout: () => {
    localStorage.clear();
    set({ chauffeur: null, token: null, moto: null });
  },
}));

import { create } from 'zustand';
import axios from 'axios';

const API = '${import.meta.env.VITE_API_URL || 'https://trans-bygagoos.onrender.com/api/v1'}';

interface Chauffeur {
  id: string;
  nom: string;
  codeAcces: string;
  statut: string;
  solde: number;
  moto: any;
}

interface AuthStore {
  chauffeur: Chauffeur | null;
  token: string | null;
  login: (codeAcces: string, pin: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  chauffeur: JSON.parse(localStorage.getItem('chauffeur') || 'null'),
  token: localStorage.getItem('chauffeur-token'),

  login: async (codeAcces: string, pin: string) => {
    const { data } = await axios.post(`${API}/auth/chauffeur/login`, { codeAcces, pin });
    localStorage.setItem('chauffeur-token', data.accessToken);
    localStorage.setItem('chauffeur', JSON.stringify(data.chauffeur));
    set({ chauffeur: data.chauffeur, token: data.accessToken });
  },

  logout: () => {
    localStorage.removeItem('chauffeur-token');
    localStorage.removeItem('chauffeur');
    set({ chauffeur: null, token: null });
  },

  loadFromStorage: () => {
    const chauffeur = JSON.parse(localStorage.getItem('chauffeur') || 'null');
    const token = localStorage.getItem('chauffeur-token');
    if (chauffeur && token) {
      set({ chauffeur, token });
    }
  },
}));

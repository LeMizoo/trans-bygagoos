import { create } from 'zustand';

interface AuthStore {
  chauffeur: any;
  token: string | null;
  login: (data: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  chauffeur: JSON.parse(localStorage.getItem('chauffeur') || 'null'),
  token: localStorage.getItem('chauffeur-token'),
  login: (data) => {
    localStorage.setItem('chauffeur-token', data.accessToken);
    localStorage.setItem('chauffeur', JSON.stringify(data.chauffeur));
    set({ chauffeur: data.chauffeur, token: data.accessToken });
  },
  logout: () => {
    localStorage.clear();
    set({ chauffeur: null, token: null });
  },
}));

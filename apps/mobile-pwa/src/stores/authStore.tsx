import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type Page = 'login' | 'accueil' | 'courses' | 'versements' | 'stats' | 'profil' | 'notifications';

interface Chauffeur {
  id: string;
  nom: string;
  codeAcces: string;
  telephone?: string;
  statut: string;
  solde: number;
  moto?: {
    id: string;
    immatriculation: string;
    typeVehicule: string;
  };
}

interface AuthContextType {
  isLoggedIn: boolean;
  page: Page;
  showNotif: boolean;
  chauffeur: Chauffeur | null;
  moto: Chauffeur['moto'] | null;
  token: string;
  setPage: (p: Page) => void;
  setShowNotif: (v: boolean) => void;
  login: (token: string, chauffeurData: Chauffeur) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('chauffeur-token') || '');
  const [chauffeur, setChauffeur] = useState<Chauffeur | null>(() => {
    try { return JSON.parse(localStorage.getItem('chauffeur') || 'null'); } catch { return null; }
  });
  const [page, setPage] = useState<Page>(() => (localStorage.getItem('chauffeur-token') ? 'accueil' : 'login'));
  const [showNotif, setShowNotif] = useState(false);

  const moto = chauffeur?.moto || null;
  const isLoggedIn = !!token && !!chauffeur;

  const login = useCallback((newToken: string, chauffeurData: Chauffeur) => {
    localStorage.setItem('chauffeur-token', newToken);
    localStorage.setItem('chauffeur', JSON.stringify(chauffeurData));
    if (chauffeurData.moto) {
      localStorage.setItem('moto', JSON.stringify(chauffeurData.moto));
    }
    setToken(newToken);
    setChauffeur(chauffeurData);
    setPage('accueil');
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setToken('');
    setChauffeur(null);
    setPage('login');
    setShowNotif(false);
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, page, showNotif, chauffeur, moto, token, setPage, setShowNotif, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

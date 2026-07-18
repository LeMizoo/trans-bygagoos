import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { api, setAuthToken, removeAuthToken } from '../api/client';

interface User {
  id: string;
  email: string;
  nom: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      api.get('/auth/me')
        .then(res => {
          console.log('✅ Auth vérifié:', res.data);
          setUser(res.data);
        })
        .catch((err) => {
          console.log('❌ Token invalide, déconnexion');
          removeAuthToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      console.log('📨 Réponse login:', response.data);
      
      // Gérer les deux formats de réponse
      const userData = response.data.user;
      const token = response.data.token || response.data.access_token;
      
      if (!token) throw new Error('Token manquant dans la réponse');
      if (!userData) throw new Error('User manquant dans la réponse');
      
      setAuthToken(token);
      setUser(userData);
      console.log('✅ Login réussi:', userData.email);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur de connexion';
      console.error('❌ Erreur login:', message);
      setError(message);
      throw err;
    }
  };

  const register = async (data: any) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', data);
      const userData = response.data.user || response.data;
      const token = response.data.token || response.data.access_token;
      
      if (token) setAuthToken(token);
      if (userData) setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur d\'inscription');
      throw err;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

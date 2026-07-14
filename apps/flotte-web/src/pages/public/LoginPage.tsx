import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-6">🚐 Trans ByGagoos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg" placeholder="admin@bygagoos.com" required />
          </div>
          <div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg" placeholder="••••••••" required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

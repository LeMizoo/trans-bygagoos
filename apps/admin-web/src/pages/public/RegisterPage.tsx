import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    telephone: '',
    flotteNom: '',
  });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        nom: formData.nom,
        telephone: formData.telephone,
        flotteNom: formData.flotteNom,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">🚐 Trans ByGagoos</h1>
          <p className="text-gray-600 mt-2">Créer ma flotte</p>
          <p className="text-xs text-gray-400 mt-1">🔓 Gratuit • Sans engagement</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la flotte *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" value={formData.flotteNom} onChange={(e) => setFormData({ ...formData, flotteNom: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ma Super Flotte" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Jean Rakoto" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="jean@flotte.com" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+261 34 12 345 67" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••" required minLength={6} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••" required />
            </div>
          </div>

          {(formError || error) && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{formError || error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {loading ? 'Inscription...' : 'Créer ma flotte 🚀'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ? <button onClick={() => navigate('/login')} className="text-indigo-600 hover:underline">Se connecter</button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle, Bike, Package } from 'lucide-react';
import { api } from '../../api/client';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    appType: '',
    prenom: '',
    nom: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        nom: `${form.prenom} ${form.nom}`,
        role: 'ADMIN_COOP',
      });
      // Rediriger vers la bonne app selon le choix
      if (form.appType === 'flotte') {
        window.location.href = 'https://trans-bygagoos-flotte.netlify.app/login';
      } else if (form.appType === 'coop') {
        window.location.href = 'https://trans-bygagoos-coop.netlify.app/login';
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-16 h-16 mx-auto mb-3 object-contain" />
            <h1 className="text-2xl font-bold text-gray-900">Inscription</h1>
            <p className="text-gray-500 mt-1">Créez votre compte gratuitement</p>
          </div>

          {/* Étapes */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full ${s <= step ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">Choisissez votre type d'activité</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setForm({ ...form, appType: 'flotte' }); setStep(2); }}
                  className="p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all text-center"
                >
                  <Bike size={40} className="mx-auto mb-3 text-orange-500" />
                  <span className="block font-semibold">Flotte Taxi-Moto</span>
                  <span className="text-xs text-gray-400">Gérer une flotte</span>
                </button>
                <button
                  onClick={() => { setForm({ ...form, appType: 'coop' }); setStep(2); }}
                  className="p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all text-center"
                >
                  <Package size={40} className="mx-auto mb-3 text-green-500" />
                  <span className="block font-semibold">Coopérative</span>
                  <span className="text-xs text-gray-400">Livraison</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft size={14} /> Retour
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" name="prenom" value={form.prenom} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Jean" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" name="nom" value={form.nom} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Rakoto" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="jean@exemple.mg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Inscription...' : 'Créer mon compte'} <CheckCircle size={18} />
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

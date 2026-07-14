import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle, Building2, Bike, Package } from 'lucide-react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // TODO: API call
      console.log('Inscription:', form);
      navigate('/login');
    } catch (err: any) {
      setError('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={18} /> Retour
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

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-fade-in-up">
                <label className="block text-sm font-medium text-gray-700 mb-2">Choisissez votre application</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'flotte', label: 'Flotte', icon: Bike, desc: 'Taxi-Moto' },
                    { value: 'coop', label: 'Coopérative', icon: Package, desc: 'Livraison' },
                    { value: 'admin', label: 'Admin', icon: Building2, desc: 'Supervision' },
                  ].map((app) => (
                    <button
                      key={app.value}
                      type="button"
                      onClick={() => { setForm({ ...form, appType: app.value }); setStep(2); }}
                      className={`p-4 rounded-xl border-2 text-center transition-all hover:shadow-md ${
                        form.appType === app.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <app.icon size={28} className="mx-auto mb-2 text-indigo-600" />
                      <span className="block text-sm font-semibold">{app.label}</span>
                      <span className="block text-xs text-gray-400">{app.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-2">
                  <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600">
                    <ArrowLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-500">
                    {form.appType === 'flotte' ? '🚀 Flotte Taxi-Moto' : form.appType === 'coop' ? '📦 Coopérative' : '🏢 Admin'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input type="text" name="prenom" value={form.prenom} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Jean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input type="text" name="nom" value={form.nom} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Rakoto" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="jean@exemple.mg" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? 'Inscription...' : 'Créer mon compte'} <CheckCircle size={18} />
                </button>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

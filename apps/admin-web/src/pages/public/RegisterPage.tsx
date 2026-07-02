import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, User, Eye, EyeOff, CheckCircle, Upload, X } from 'lucide-react';
import axios from 'axios';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'GRATUIT';

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    nomFlotte: '',
    description: '',
    telephone: '',
    adresse: '',
    nom: '',
    email: '',
    password: '',
    abonnement: plan,
    logo: null as File | null,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, logo: file });
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nomFlotte', form.nomFlotte);
      formData.append('description', form.description);
      formData.append('telephone', form.telephone);
      formData.append('adresse', form.adresse);
      formData.append('nom', form.nom);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('abonnement', form.abonnement);
      if (form.logo) formData.append('logo', form.logo);

      await axios.post(`${API}/flottes/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStep('success');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flotte créée ! 🎉</h2>
          <p className="text-gray-500 mb-6">
            Votre flotte <strong>{form.nomFlotte}</strong> est prête.
            Vous pouvez maintenant vous connecter et commencer à la gérer.
          </p>
          <button onClick={() => navigate('/login')} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const planLabels: Record<string, string> = {
    'GRATUIT': '🆓 Gratuit (1 moto)',
    'Standard': '🥈 Standard (2-5 motos)',
    'Premium': '🥇 Premium (6-10 motos)',
    'Business': '💎 Business (11+ motos)',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6">
          <ArrowLeft size={18} /> Retour
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Créer votre flotte</h1>
            <p className="text-gray-500 mt-1">Plan sélectionné : <strong>{planLabels[plan] || plan}</strong></p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo */}
            <div className="flex justify-center">
              <label className="cursor-pointer">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo" className="w-24 h-24 rounded-2xl object-cover border-2 border-primary" />
                    <button type="button" onClick={() => { setLogoPreview(null); setForm({ ...form, logo: null }); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary transition">
                    <div className="text-center">
                      <Upload size={24} className="text-gray-400 mx-auto" />
                      <span className="text-[10px] text-gray-400 mt-1 block">Logo</span>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>

            {/* Infos Flotte */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Building2 size={18} /> Votre Flotte</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nom de la flotte *</label>
                <input type="text" required value={form.nomFlotte} onChange={e => setForm({...form, nomFlotte: e.target.value})}
                  placeholder="Ex: Rakoto Trans" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone</label>
                <input type="text" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})}
                  placeholder="+261 ..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Adresse</label>
                <input type="text" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})}
                  placeholder="Ville, quartier..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Décrivez votre flotte..." rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
              </div>
            </div>

            {/* Infos Propriétaire */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><User size={18} /> Propriétaire</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Votre nom *</label>
                <input type="text" required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                  placeholder="Votre nom complet" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="votre@email.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mot de passe *</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="6 caractères minimum" minLength={6} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Abonnement */}
            <input type="hidden" value={form.abonnement} />

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25">
              {loading ? 'Création en cours...' : '🚀 Créer ma flotte'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Déjà un compte ? <button type="button" onClick={() => navigate('/login')} className="text-primary hover:underline">Connectez-vous</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

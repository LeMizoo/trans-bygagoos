/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, User, Eye, EyeOff, CheckCircle, Upload, X } from 'lucide-react';
import axios from 'axios';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ nomFlotte: '', telephone: '', adresse: '', description: '', nom: '', email: '', password: '', logo: null as string | null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload: any = { nomFlotte: form.nomFlotte, description: form.description, telephone: form.telephone, adresse: form.adresse, nom: form.nom, email: form.email, password: form.password, logo: form.logo, typeFlotte: 'TAXI_MOTO', abonnement: 'GRATUIT' };
      await axios.post(`${API}/flottes/register`, payload, { timeout: 30000 });
      setStep('success');
    } catch (err: any) {
      setError(err?.response?.status === 409 ? '⚠️ Cette flotte existe déjà.' : err?.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally { setLoading(false); }
  };

  if (step === 'success') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Flotte créée ! 🎉</h2>
        <p className="text-gray-500 mb-6">Votre flotte <strong>{form.nomFlotte}</strong> est prête. Vous pouvez maintenant ajouter des véhicules.</p>
        <p className="text-sm text-yellow-600 mb-4">🆓 Démarrage gratuit · Tous types de véhicules</p>
        <button onClick={() => navigate('/login')} className="w-full bg-primary text-white py-3 rounded-xl font-semibold">Se connecter</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6"><ArrowLeft size={18} /> Retour</button>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Créer votre flotte</h1>
            <p className="text-gray-500 mt-1">🆓 Gratuit · 🏍️🚗🚌 Tous types de véhicules</p>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <label className="cursor-pointer">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border-2 border-primary" />
                    <button type="button" onClick={() => { setLogoPreview(null); setForm({ ...form, logo: null }); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary transition"><Upload size={20} className="text-gray-400" /></div>
                )}
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = e => { setLogoPreview(e.target?.result as string); setForm({ ...form, logo: e.target?.result as string }); }; r.readAsDataURL(f); } }} className="hidden" />
              </label>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-700"><Building2 size={16} className="inline" /> Votre Flotte</h3>
              <input type="text" required value={form.nomFlotte} onChange={e => setForm({...form, nomFlotte: e.target.value})} placeholder="Nom de la flotte *" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
              <input type="text" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} placeholder="Téléphone" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
              <input type="text" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} placeholder="Adresse" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={2} className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none" />
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-700"><User size={16} className="inline" /> Propriétaire</h3>
              <input type="text" required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Votre nom *" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email *" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mot de passe *" minLength={6} className="w-full px-4 py-2.5 border rounded-xl text-sm pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50">
              {loading ? 'Création...' : '🚀 Créer ma flotte gratuitement'}
            </button>
            <p className="text-center text-sm text-gray-400">Déjà un compte ? <a href="/login" className="text-primary hover:underline">Connectez-vous</a></p>
          </form>
        </div>
      </div>
    </div>
  );
}

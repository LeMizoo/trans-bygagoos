import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, User, Eye, EyeOff, CheckCircle, Upload, X, CreditCard } from 'lucide-react';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const plans = [
  { nom: 'Gratuit', abonnement: 'GRATUIT', motos: '1 moto', prix: '0 Ar/mois' },
  { nom: 'Standard', abonnement: '2_5', motos: '2-5 motos', prix: '50 000 Ar/mois' },
  { nom: 'Premium', abonnement: '6_10', motos: '6-10 motos', prix: '90 000 Ar/mois' },
  { nom: 'Business', abonnement: '11_PLUS', motos: '11+ motos', prix: '150 000 Ar/mois' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'Gratuit';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(planFromUrl);
  const [form, setForm] = useState({
    nomFlotte: '', description: '', telephone: '', adresse: '',
    nom: '', email: '', password: '',
  });

  const planActuel = plans.find(p => p.nom === selectedPlan) || plans[0];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Logo trop volumineux (max 5 MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => { const base64 = reader.result as string; setLogoPreview(base64); setLogoBase64(base64); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await axios.post(`${API}/flottes/register`, {
        ...form, logo: logoBase64, abonnement: planActuel.abonnement,
      });
      setStep('success');
    } catch (err: any) { setError(err?.response?.data?.message || 'Erreur lors de l\'inscription'); }
    finally { setLoading(false); }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-500" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flotte créée ! 🎉</h2>
          <p className="text-gray-500 mb-6">Votre flotte <strong>{form.nomFlotte}</strong> est prête.</p>
          <button onClick={() => navigate('/login')} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all">Se connecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6"><ArrowLeft size={18} /> Retour</button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Créer votre flotte</h1>
            <p className="text-gray-500 mt-1">Commencez à gérer votre flotte en quelques minutes</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}

          {/* Plan sélectionné */}
          <div className="bg-primary/5 border-2 border-primary rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-primary" />
                <div>
                  <p className="font-bold text-gray-900">Plan {planActuel.nom}</p>
                  <p className="text-sm text-gray-500">{planActuel.motos} • {planActuel.prix}</p>
                </div>
              </div>
              <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                {plans.map(p => <option key={p.nom} value={p.nom}>{p.nom}</option>)}
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Logo de la flotte (optionnel)</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Building2 size={32} className="text-gray-400" />}
                </div>
                <div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50"><Upload size={16} /> Choisir un logo</button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG. Max 5 MB</p>
                  {logoPreview && <button type="button" onClick={() => { setLogoPreview(null); setLogoBase64(null); }} className="text-xs text-red-500 mt-1 flex items-center gap-1"><X size={12} /> Supprimer</button>}
                </div>
              </div>
            </div>

            {/* Infos Flotte */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Building2 size={18} /> Votre Flotte</h3>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Nom de la flotte *</label><input type="text" required value={form.nomFlotte} onChange={e => setForm({...form, nomFlotte: e.target.value})} placeholder="Ex: Rakoto Trans" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Téléphone</label><input type="text" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} placeholder="+261 ..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Adresse</label><input type="text" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} placeholder="Ville, quartier..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Décrivez votre flotte..." rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none" /></div>
            </div>

            {/* Infos Propriétaire */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><User size={18} /> Propriétaire</h3>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Votre nom *</label><input type="text" required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Votre nom complet" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Email *</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="votre@email.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Mot de passe *</label>
                <div className="relative"><input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="6 caractères minimum" minLength={6} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25">
              {loading ? 'Création en cours...' : '🚀 Créer ma flotte'}
            </button>
            <p className="text-center text-sm text-gray-400">Déjà un compte ? <button type="button" onClick={() => navigate('/login')} className="text-primary hover:underline">Connectez-vous</button></p>
          </form>
        </div>
      </div>
    </div>
  );
}

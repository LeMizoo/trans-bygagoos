import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nomFlotte: '',
    description: '',
    telephone: '',
    adresse: '',
    nom: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/flottes/register`, form);
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6">
          <ArrowLeft size={18} /> Retour
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Créer votre flotte</h1>
            <p className="text-gray-500 mt-1">Commencez à gérer votre flotte en quelques minutes</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Infos Flotte */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Building2 size={18} /> Votre Flotte
              </h3>
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
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <User size={18} /> Propriétaire
              </h3>
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

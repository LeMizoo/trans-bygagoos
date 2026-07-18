import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Save, Sun, Moon, Monitor, Globe, ToggleLeft, Crown, Star, Zap, Check } from 'lucide-react';
import { api } from '../../api/client';

const plansFlotte = [
  { nom: 'Basic', prix: 25000, vehiculesMax: 5, chauffeursMax: 10, features: ['Tableau de bord', 'Gestion chauffeurs', 'Suivi kilométrage'] },
  { nom: 'Standard', prix: 50000, vehiculesMax: 20, chauffeursMax: 50, features: ['Tout Basic', 'Rapports financiers', 'Notifications', 'Assistance prioritaire'] },
  { nom: 'Premium', prix: 100000, vehiculesMax: 100, chauffeursMax: 200, features: ['Tout Standard', 'API personnalisée', 'Support dédié 24/7', 'Marque blanche'] },
];

const plansCoop = [
  { nom: 'Basic', prix: 30000, vehiculesMax: 5, livreursMax: 15, features: ['Tableau de bord', 'Gestion livreurs', 'Suivi commandes'] },
  { nom: 'Standard', prix: 60000, vehiculesMax: 20, livreursMax: 60, features: ['Tout Basic', 'Rapports financiers', 'Notifications', 'Assistance prioritaire'] },
  { nom: 'Premium', prix: 120000, vehiculesMax: 100, livreursMax: 300, features: ['Tout Standard', 'API personnalisée', 'Support dédié 24/7', 'Marque blanche'] },
];

export const ParametresPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'GENERAL';
  const [params, setParams] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/parametres').then(res => setParams(res.data || {})).finally(() => setLoading(false));
  }, []);

  const saveTheme = () => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    setMsg('✅ Thème sauvegardé');
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  // PLANS D'ABONNEMENT
  if (type === 'FLOTTE' || type === 'COOP') {
    const plans = type === 'FLOTTE' ? plansFlotte : plansCoop;
    const title = type === 'FLOTTE' ? '🏍️ Plans Flotte' : '📦 Plans Coop';
    const emoji = type === 'FLOTTE' ? '🏍️' : '📦';

    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-500 mt-1">Plans d'abonnement disponibles</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const icons = [Zap, Star, Crown];
            const colors = ['from-gray-500 to-slate-600', 'from-orange-500 to-amber-600', 'from-indigo-500 to-purple-600'];
            const Icon = icons[i];
            return (
              <div key={plan.nom} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all ${i === 2 ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 dark:border-gray-700'}`}>
                {i === 2 && <div className="bg-indigo-500 text-white text-xs font-bold text-center py-1.5">⭐ LE PLUS POPULAIRE</div>}
                <div className="p-6">
                  <div className={`bg-gradient-to-br ${colors[i]} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.nom}</h3>
                  <div className="text-3xl font-extrabold mb-4">{plan.prix.toLocaleString()} <span className="text-sm font-normal text-gray-400">Ar/mois</span></div>
                  <div className="space-y-3 mb-6">
                    <div className="text-sm text-gray-500"><strong>{plan.vehiculesMax}</strong> véhicules max</div>
                    <div className="text-sm text-gray-500"><strong>{plan.chauffeursMax || plan.livreursMax}</strong> {type === 'FLOTTE' ? 'chauffeurs' : 'livreurs'} max</div>
                    <hr className="dark:border-gray-700" />
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm"><Check size={16} className="text-green-500" /> {f}</div>
                    ))}
                  </div>
                  <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity">
                    {i === 2 ? '✨ Choisir Premium' : 'Choisir ' + plan.nom}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // PARAMÈTRES GÉNÉRAUX
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Paramètres généraux</h2><p className="text-gray-500 mt-1">Configuration de la plateforme</p></div>
        <button onClick={saveTheme} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700"><Save size={18} /> Enregistrer</button>
      </div>
      {msg && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl text-sm font-medium">{msg}</div>}

      {/* Thème */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sun size={20} /> Thème (Mode)</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'light', icon: Sun, label: '☀️ Clair' },
            { key: 'dark', icon: Moon, label: '🌙 Sombre' },
            { key: 'system', icon: Monitor, label: '💻 Système' },
          ].map(t => (
            <button key={t.key} onClick={() => setTheme(t.key)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${theme === t.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <t.icon size={24} className={`mx-auto mb-1 ${theme === t.key ? 'text-indigo-500' : 'text-gray-400'}`} />
              <div className="font-bold text-xs">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Général */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border space-y-4 mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><Globe size={20} /> Général</h3>
        {['monnaie', 'langue'].map(k => (
          <div key={k}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{k === 'monnaie' ? 'Monnaie' : 'Langue'}</label>
            {k === 'langue' ? (
              <select value={params[k] || 'fr'} onChange={e => setParams({...params, [k]: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="fr">Français</option><option value="mg">Malagasy</option><option value="en">English</option>
              </select>
            ) : (
              <input value={params[k] || 'Ar'} onChange={e => setParams({...params, [k]: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            )}
          </div>
        ))}
      </div>

      {/* Toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2"><ToggleLeft size={20} /> Interrupteurs</h3>
        {['notificationsActives', 'maintenanceMode'].map(k => (
          <div key={k} className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{k === 'notificationsActives' ? 'Notifications globales' : 'Mode maintenance'}</div>
              <div className="text-xs text-gray-400">{k === 'maintenanceMode' ? 'Désactive le site pour les utilisateurs' : 'Active/désactive toutes les notifications'}</div>
            </div>
            <button onClick={() => setParams({...params, [k]: !params[k]})}
              className={`relative w-12 h-6 rounded-full transition-colors ${params[k] ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${params[k] ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

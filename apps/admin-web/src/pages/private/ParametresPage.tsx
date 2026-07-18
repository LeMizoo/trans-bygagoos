import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Save, Sun, Moon, Monitor, Globe, ToggleLeft, Edit3, Percent, DollarSign, Bike, Users } from 'lucide-react';
import { api } from '../../api/client';

export const ParametresPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'GENERAL';
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Paramètres généraux
  const [params, setParams] = useState<any>({});
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  // Plans Flotte
  const [plansFlotte, setPlansFlotte] = useState([
    { nom: 'Fremium', prix: 0, vehiculesMax: 1, chauffeursMax: 1, actif: true },
    { nom: 'Basic', prix: 15000, vehiculesMax: 5, chauffeursMax: 10, actif: true },
    { nom: 'Standard', prix: 35000, vehiculesMax: 20, chauffeursMax: 50, actif: true },
    { nom: 'Premium', prix: 75000, vehiculesMax: 100, chauffeursMax: 200, actif: true },
  ]);
  const [reductionFlotte, setReductionFlotte] = useState(7);

  // Plans Coop
  const [plansCoop, setPlansCoop] = useState([
    { nom: 'Fremium', prix: 0, vehiculesMax: 1, livreursMax: 2, actif: true },
    { nom: 'Basic', prix: 20000, vehiculesMax: 5, livreursMax: 15, actif: true },
    { nom: 'Standard', prix: 45000, vehiculesMax: 20, livreursMax: 60, actif: true },
    { nom: 'Premium', prix: 90000, vehiculesMax: 100, livreursMax: 300, actif: true },
  ]);
  const [reductionCoop, setReductionCoop] = useState(7);

  useEffect(() => {
    api.get('/parametres').then(res => setParams(res.data || {})).finally(() => setLoading(false));
  }, []);

  const save = (section: string) => {
    if (section === 'theme') {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    }
    setMsg(`✅ ${section} sauvegardé`);
    setTimeout(() => setMsg(''), 3000);
  };

  const updatePlan = (plans: any[], setPlans: any, index: number, field: string, value: any) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: field === 'actif' ? !updated[index].actif : value };
    setPlans(updated);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  const renderPlans = (title: string, emoji: string, plans: any[], setPlans: any, reduction: number, setReduction: any, section: string, isFlotte: boolean) => (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{emoji} {title}</h2>
          <p className="text-gray-500 mt-1">Configuration des plans d'abonnement</p>
        </div>
        <button onClick={() => save(section)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700">
          <Save size={18} /> Enregistrer
        </button>
      </div>
      {msg && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl text-sm font-medium">{msg}</div>}

      {/* Plans */}
      <div className="space-y-4 mb-8">
        <h3 className="font-bold text-lg flex items-center gap-2"><DollarSign size={20} /> Plans mensuels</h3>
        {plans.map((plan: any, i: number) => (
          <div key={plan.nom} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border flex flex-wrap items-center gap-4">
            <div className="w-24 font-bold text-lg">{plan.nom}</div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input type="number" value={plan.prix} onChange={e => updatePlan(plans, setPlans, i, 'prix', parseInt(e.target.value) || 0)}
                className="w-28 p-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-center font-bold text-lg" />
              <span className="text-sm text-gray-400">Ar/mois</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bike size={16} className="text-gray-400" />
                <input type="number" value={plan.vehiculesMax} onChange={e => updatePlan(plans, setPlans, i, 'vehiculesMax', parseInt(e.target.value) || 0)}
                  className="w-20 p-2 bg-gray-50 dark:bg-gray-900 border rounded-xl text-center text-sm" />
                <span className="text-xs text-gray-400">véhicules</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <input type="number" value={isFlotte ? plan.chauffeursMax : plan.livreursMax} onChange={e => updatePlan(plans, setPlans, i, isFlotte ? 'chauffeursMax' : 'livreursMax', parseInt(e.target.value) || 0)}
                  className="w-20 p-2 bg-gray-50 dark:bg-gray-900 border rounded-xl text-center text-sm" />
                <span className="text-xs text-gray-400">{isFlotte ? 'chauffeurs' : 'livreurs'}</span>
              </div>
            </div>
            <button onClick={() => updatePlan(plans, setPlans, i, 'actif', null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${plan.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {plan.actif ? 'Actif' : 'Inactif'}
            </button>
          </div>
        ))}
      </div>

      {/* Réduction annuelle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><Percent size={20} /> Réduction abonnement annuel</h3>
        <div className="flex items-center gap-3">
          <input type="number" value={reduction} onChange={e => setReduction(parseInt(e.target.value) || 0)}
            className="w-24 p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-center font-bold text-xl" min={0} max={100} />
          <span className="text-lg font-bold">%</span>
          <span className="text-sm text-gray-400">de réduction pour les abonnements annuels</span>
        </div>
      </div>
    </div>
  );

  if (type === 'FLOTTE') return renderPlans('Plans Flotte', '🏍️', plansFlotte, setPlansFlotte, reductionFlotte, setReductionFlotte, 'Plans Flotte', true);
  if (type === 'COOP') return renderPlans('Plans Coop', '📦', plansCoop, setPlansCoop, reductionCoop, setReductionCoop, 'Plans Coop', false);

  // GÉNÉRAL
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Paramètres généraux</h2><p className="text-gray-500 mt-1">Configuration de la plateforme</p></div>
        <button onClick={() => save('Paramètres généraux')} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700"><Save size={18} /> Enregistrer</button>
      </div>
      {msg && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl text-sm font-medium">{msg}</div>}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sun size={20} /> Thème</h3>
        <div className="grid grid-cols-3 gap-3">
          {[{ key: 'light', icon: Sun, label: '☀️ Clair' }, { key: 'dark', icon: Moon, label: '🌙 Sombre' }, { key: 'system', icon: Monitor, label: '💻 Système' }].map(t => (
            <button key={t.key} onClick={() => setTheme(t.key)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${theme === t.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <t.icon size={24} className={`mx-auto mb-1 ${theme === t.key ? 'text-indigo-500' : 'text-gray-400'}`} />
              <div className="font-bold text-xs">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border space-y-4 mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><Globe size={20} /> Général</h3>
        {['monnaie', 'langue'].map(k => (
          <div key={k}>
            <label className="block text-sm font-semibold mb-2">{k === 'monnaie' ? 'Monnaie' : 'Langue'}</label>
            {k === 'langue' ? (
              <select value={params[k] || 'fr'} onChange={e => setParams({...params, [k]: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl">
                <option value="fr">Français</option><option value="mg">Malagasy</option><option value="en">English</option>
              </select>
            ) : (
              <input value={params[k] || 'Ar'} onChange={e => setParams({...params, [k]: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2"><ToggleLeft size={20} /> Interrupteurs</h3>
        {['notificationsActives', 'maintenanceMode'].map(k => (
          <div key={k} className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{k === 'notificationsActives' ? 'Notifications globales' : 'Mode maintenance'}</div>
              <div className="text-xs text-gray-400">{k === 'maintenanceMode' ? 'Désactive la plateforme' : 'Active/désactive les notifications'}</div>
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

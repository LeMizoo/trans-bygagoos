import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Save, Sun, Moon, Monitor, Globe, ToggleLeft, Percent, Bike, Users, ArrowLeft } from 'lucide-react';
import { api } from '../../api/client';
import { setTheme } from '../../stores/themeStore';

export const ParametresPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'GENERAL';
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [params, setParams] = useState<any>({});
  const [theme, setThemeState] = useState(localStorage.getItem('theme') || 'system');
  const [plansFlotte, setPlansFlotte] = useState<any[]>([]);
  const [plansCoop, setPlansCoop] = useState<any[]>([]);
  const [reductionFlotte, setReductionFlotte] = useState(0);
  const [reductionCoop, setReductionCoop] = useState(0);

  useEffect(() => {
    api.get('/parametres').then(res => {
      const data = res.data || {};
      setParams(data);
      setPlansFlotte(data.plansFlotte || [
        { nom: 'Fremium', prix: 0, vehiculesMax: 1, chauffeursMax: 1, actif: true },
        { nom: 'Basic', prix: 15000, vehiculesMax: 5, chauffeursMax: 10, actif: true },
        { nom: 'Standard', prix: 35000, vehiculesMax: 20, chauffeursMax: 50, actif: true },
        { nom: 'Premium', prix: 75000, vehiculesMax: 100, chauffeursMax: 200, actif: true },
      ]);
      setReductionFlotte(data.reductionAnnuelleFlotte ?? 7);
      setPlansCoop(data.plansCoop || [
        { nom: 'Fremium', prix: 0, vehiculesMax: 1, livreursMax: 2, actif: true },
        { nom: 'Basic', prix: 20000, vehiculesMax: 5, livreursMax: 15, actif: true },
        { nom: 'Standard', prix: 45000, vehiculesMax: 20, livreursMax: 60, actif: true },
        { nom: 'Premium', prix: 90000, vehiculesMax: 100, livreursMax: 300, actif: true },
      ]);
      setReductionCoop(data.reductionAnnuelleCoop ?? 7);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setMsg('');
    try {
      const payload: any = {};
      if (type === 'FLOTTE') {
        payload.plansFlotte = plansFlotte;
        payload.reductionAnnuelleFlotte = reductionFlotte;
      } else if (type === 'COOP') {
        payload.plansCoop = plansCoop;
        payload.reductionAnnuelleCoop = reductionCoop;
      } else {
        // Sauvegarder le thème
        setTheme(theme as 'light' | 'dark' | 'system');
        payload.monnaie = params.monnaie || 'Ar';
        payload.langue = params.langue || 'fr';
        payload.notificationsActives = params.notificationsActives ?? true;
        payload.maintenanceMode = params.maintenanceMode ?? false;
      }
      await api.put('/parametres', payload);
      setMsg('✅ Paramètres sauvegardés avec succès !');
    } catch (err: any) {
      setMsg('❌ Erreur: ' + (err.response?.data?.message || err.message));
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const updatePlan = (plans: any[], setPlans: any, i: number, field: string, value: any) => {
    const updated = [...plans];
    updated[i] = { ...updated[i], [field]: field === 'actif' ? !updated[i].actif : value };
    setPlans(updated);
  };

  const handleThemeChange = (newTheme: string) => {
    setThemeState(newTheme);
    setTheme(newTheme as 'light' | 'dark' | 'system');
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  // PAGE GÉNÉRALE
  if (type === 'GENERAL') {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings size={28} /> Paramètres généraux
          </h2>
          <p className="text-gray-500 mt-1">Configuration globale de la plateforme</p>
        </div>

        {msg && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium animate-fade-in-up ${msg.startsWith('✅') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {msg}
          </div>
        )}

        {/* Liens rapides */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a href="/parametres?type=FLOTTE" className="bg-white dark:bg-gray-800 rounded-xl p-4 border hover:shadow-md transition-all flex items-center gap-3">
            <span className="text-2xl">🏍️</span>
            <div>
              <div className="font-bold text-sm">Plans Flotte</div>
              <div className="text-xs text-gray-400">Configurer les abonnements</div>
            </div>
          </a>
          <a href="/parametres?type=COOP" className="bg-white dark:bg-gray-800 rounded-xl p-4 border hover:shadow-md transition-all flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <div className="font-bold text-sm">Plans Coop</div>
              <div className="text-xs text-gray-400">Configurer les abonnements</div>
            </div>
          </a>
        </div>

        {/* Thème */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sun size={20} /> Apparence</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'light', icon: Sun, label: '☀️ Clair', desc: 'Thème clair' },
              { key: 'dark', icon: Moon, label: '🌙 Sombre', desc: 'Thème sombre' },
              { key: 'system', icon: Monitor, label: '💻 Système', desc: 'Auto' },
            ].map(t => (
              <button key={t.key} onClick={() => handleThemeChange(t.key)}
                className={`p-4 rounded-xl border-2 transition-all text-center hover:shadow-md ${
                  theme === t.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}>
                <t.icon size={28} className={`mx-auto mb-2 ${theme === t.key ? 'text-indigo-500' : 'text-gray-400'}`} />
                <div className="font-bold text-sm">{t.label}</div>
                <div className="text-xs text-gray-400 mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Général */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border space-y-5 mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2"><Globe size={20} /> Général</h3>
          <div>
            <label className="block text-sm font-semibold mb-2">💱 Monnaie</label>
            <input value={params.monnaie || 'Ar'} onChange={e => setParams({...params, monnaie: e.target.value})} 
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">🌐 Langue</label>
            <select value={params.langue || 'fr'} onChange={e => setParams({...params, langue: e.target.value})} 
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="fr">🇫🇷 Français</option>
              <option value="mg">🇲🇬 Malagasy</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>

        {/* Interrupteurs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border space-y-5 mb-8">
          <h3 className="font-bold text-lg flex items-center gap-2"><ToggleLeft size={20} /> Interrupteurs</h3>
          {[
            { key: 'notificationsActives', label: '🔔 Notifications globales', desc: 'Activer/désactiver toutes les notifications' },
            { key: 'maintenanceMode', label: '🚧 Mode maintenance', desc: 'Désactive l\'accès à la plateforme pour les utilisateurs' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
              <button onClick={() => setParams({...params, [item.key]: !params[item.key]})}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${params[item.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${params[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={save} 
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-[0.98]">
          <Save size={22} /> Enregistrer les paramètres
        </button>
      </div>
    );
  }

  // PAGES PLANS (FLOTTE ou COOP)
  const plans = type === 'FLOTTE' ? plansFlotte : plansCoop;
  const setPlans = type === 'FLOTTE' ? setPlansFlotte : setPlansCoop;
  const reduction = type === 'FLOTTE' ? reductionFlotte : reductionCoop;
  const setReduction = type === 'FLOTTE' ? setReductionFlotte : setReductionCoop;
  const isFlotte = type === 'FLOTTE';
  const title = isFlotte ? '🏍️ Plans Flotte' : '📦 Plans Coop';

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <a href="/parametres" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3">
          <ArrowLeft size={16} /> Retour aux paramètres généraux
        </a>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-gray-500 mt-1">Configuration des plans d'abonnement</p>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium animate-fade-in-up ${msg.startsWith('✅') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {msg}
        </div>
      )}

      <div className="space-y-4 mb-8">
        <h3 className="font-bold text-lg">📋 Plans mensuels</h3>
        {plans.map((plan: any, i: number) => (
          <div key={plan.nom} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border flex flex-wrap items-center gap-4 card-hover">
            <div className="w-28 font-bold text-lg">{plan.nom}</div>
            <div className="flex items-center gap-2">
              <input type="number" value={plan.prix} onChange={e => updatePlan(plans, setPlans, i, 'prix', parseInt(e.target.value) || 0)}
                className="w-28 p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              <span className="text-sm text-gray-400">Ar/mois</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Bike size={15} className="text-gray-400" />
                <input type="number" value={plan.vehiculesMax} onChange={e => updatePlan(plans, setPlans, i, 'vehiculesMax', parseInt(e.target.value) || 0)}
                  className="w-16 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                <span className="text-xs text-gray-400">véhicules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-gray-400" />
                <input type="number" value={isFlotte ? plan.chauffeursMax : plan.livreursMax} 
                  onChange={e => updatePlan(plans, setPlans, i, isFlotte ? 'chauffeursMax' : 'livreursMax', parseInt(e.target.value) || 0)}
                  className="w-16 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                <span className="text-xs text-gray-400">{isFlotte ? 'chauffeurs' : 'livreurs'}</span>
              </div>
            </div>
            <button onClick={() => updatePlan(plans, setPlans, i, 'actif', null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                plan.actif ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
              {plan.actif ? '✅ Actif' : '❌ Inactif'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border mb-8">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><Percent size={20} /> Réduction abonnement annuel</h3>
        <div className="flex items-center gap-3">
          <input type="number" value={reduction} onChange={e => setReduction(parseInt(e.target.value) || 0)}
            className="w-24 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center font-bold text-xl focus:ring-2 focus:ring-indigo-500 outline-none" min={0} max={100} />
          <span className="text-lg font-bold">%</span>
          <span className="text-sm text-gray-400">pour les abonnements annuels</span>
        </div>
      </div>

      <button onClick={save} 
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-[0.98]">
        <Save size={22} /> Enregistrer toutes les modifications
      </button>
    </div>
  );
};

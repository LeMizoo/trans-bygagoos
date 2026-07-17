import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Save, Sun, Moon, Monitor, Globe, ToggleLeft, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

export const ParametresPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'GENERAL';
  const [params, setParams] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    if (type === 'GENERAL') {
      api.get('/parametres').then(res => setParams(res.data || {})).finally(() => setLoading(false));
    } else {
      api.get('/parametres').then(res => setParams(res.data || {})).finally(() => setLoading(false));
    }
  }, [type]);

  const save = async () => {
    setSaving(true);
    try {
      if (type === 'GENERAL') {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
        await api.put('/parametres', params);
        setMsg('✅ Paramètres sauvegardés');
      } else {
        await api.put('/parametres', params);
        setMsg('✅ Sauvegardé');
      }
    } catch { setMsg('❌ Erreur'); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const title = type === 'FLOTTE' ? '🏍️ Paramètres Flotte' : type === 'COOP' ? '📦 Paramètres Coop' : '⚙️ Paramètres généraux';

  const flotteFields = ['prixBaseKm', 'prixParKm', 'commissionFlotte', 'tarifLocationJournaliere'];
  const coopFields = ['prixBaseKm', 'prixParKm', 'commissionCoop', 'delaiPaiement'];
  const labels: any = {
    prixBaseKm: 'Prix de base (Ar)', prixParKm: 'Prix par km (Ar)',
    commissionFlotte: 'Commission Flotte (%)', commissionCoop: 'Commission Coop (%)',
    tarifLocationJournaliere: 'Tarif location/jour (Ar)', delaiPaiement: 'Délai paiement (jours)',
    monnaie: 'Monnaie', langue: 'Langue', notificationsActives: 'Notifications globales', maintenanceMode: 'Mode maintenance'
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2><p className="text-gray-500 mt-1">Configuration</p></div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"><Save size={18} /> {saving ? '...' : 'Enregistrer'}</button>
      </div>
      {msg && <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

      {type === 'GENERAL' ? (
        <div className="space-y-6">
          {/* Thème */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sun size={20} /> Thème (Mode)</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'light', icon: Sun, label: '☀️ Clair' },
                { key: 'dark', icon: Moon, label: '🌙 Sombre' },
                { key: 'system', icon: Monitor, label: '💻 Système' },
              ].map(t => (
                <button key={t.key} onClick={() => setTheme(t.key)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${theme === t.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  <t.icon size={24} className={`mx-auto mb-1 ${theme === t.key ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div className="font-bold text-xs">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Général */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Globe size={20} /> Général</h3>
            {['monnaie', 'langue'].map(k => (
              <div key={k}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{labels[k]}</label>
                {k === 'langue' ? (
                  <select value={params[k] || 'fr'} onChange={e => setParams({...params, [k]: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="fr">Français</option><option value="mg">Malagasy</option><option value="en">English</option>
                  </select>
                ) : (
                  <input type="text" value={params[k] || ''} onChange={e => setParams({...params, [k]: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg" />
                )}
              </div>
            ))}
          </div>

          {/* Toggles */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><ToggleLeft size={20} /> Interrupteurs</h3>
            {['notificationsActives', 'maintenanceMode'].map(k => (
              <div key={k} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{labels[k]}</div>
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
      ) : (
        <div className="space-y-4">
          {(type === 'FLOTTE' ? flotteFields : coopFields).map((k: string) => (
            <div key={k} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{labels[k] || k}</label>
              <input type="text" value={params[k] || ''} onChange={e => setParams({...params, [k]: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

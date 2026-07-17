import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Save, Sun, Moon, Monitor } from 'lucide-react';
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
      setParams({ theme });
      setLoading(false);
      return;
    }
    api.get('/parametres').then(res => setParams(res.data || {})).finally(() => setLoading(false));
  }, [type]);

  const save = async () => {
    setSaving(true);
    if (type === 'GENERAL') {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
      setMsg('✅ Thème sauvegardé');
    } else {
      try { await api.put('/parametres', params); setMsg('✅ Sauvegardé'); }
      catch { setMsg('❌ Erreur'); }
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const title = type === 'FLOTTE' ? '🏍️ Paramètres Flotte' : type === 'COOP' ? '📦 Paramètres Coop' : '⚙️ Paramètres généraux';
  const fields: any = {
    FLOTTE: ['prixBaseKm', 'prixParKm', 'commissionFlotte', 'tarifLocationJournaliere'],
    COOP: ['prixBaseKm', 'prixParKm', 'commissionCoop', 'delaiPaiement'],
    GENERAL: [],
  };
  const labels: any = {
    prixBaseKm: 'Prix de base (Ar)', prixParKm: 'Prix par km (Ar)',
    commissionFlotte: 'Commission Flotte (%)', commissionCoop: 'Commission Coop (%)',
    tarifLocationJournaliere: 'Tarif location/jour (Ar)', delaiPaiement: 'Délai paiement (jours)',
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
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4">🎨 Thème (Mode)</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'light', icon: Sun, label: '☀️ Clair', desc: 'Mode clair' },
                { key: 'dark', icon: Moon, label: '🌙 Sombre', desc: 'Mode sombre' },
                { key: 'system', icon: Monitor, label: '💻 Système', desc: 'Préférence OS' },
              ].map(t => (
                <button key={t.key} onClick={() => setTheme(t.key)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${theme === t.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  <t.icon size={28} className={`mx-auto mb-2 ${theme === t.key ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="text-xs text-gray-400">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2">ℹ️ Autres paramètres</h3>
            <p className="text-gray-400 text-sm">Langue, notifications, mode maintenance, etc. (à venir)</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {fields[type]?.map((key: string) => (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{labels[key] || key}</label>
              <input type="text" value={params[key] || ''} onChange={e => setParams({...params, [key]: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

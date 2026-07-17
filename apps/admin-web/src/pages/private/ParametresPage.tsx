import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Save, RefreshCw, DollarSign, Percent, Clock, Globe, ToggleLeft } from 'lucide-react';
import { api } from '../../api/client';

export const ParametresPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'GENERAL';
  const [params, setParams] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/parametres').then(res => setParams(res.data || {})).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try { await api.put('/parametres', params); setMsg('✅ Sauvegardé'); }
    catch { setMsg('❌ Erreur'); }
    finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
  };

  const title = type === 'FLOTTE' ? '🏍️ Paramètres Flotte' : type === 'COOP' ? '📦 Paramètres Coop' : '⚙️ Paramètres généraux';
  const fields = type === 'FLOTTE' ? ['prixBaseKm', 'prixParKm', 'commissionFlotte', 'tarifLocationJournaliere'] :
                 type === 'COOP' ? ['prixBaseKm', 'prixParKm', 'commissionCoop', 'delaiPaiement'] :
                 ['monnaie', 'langue', 'notificationsActives', 'maintenanceMode'];

  const labels: any = { prixBaseKm: 'Prix de base (Ar)', prixParKm: 'Prix par km (Ar)', commissionFlotte: 'Commission Flotte (%)', commissionCoop: 'Commission Coop (%)', tarifLocationJournaliere: 'Tarif location/jour (Ar)', delaiPaiement: 'Délai paiement (jours)', monnaie: 'Monnaie', langue: 'Langue', notificationsActives: 'Notifications', maintenanceMode: 'Mode maintenance' };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-500 mt-1">Configuration</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
          <Save size={18} /> {saving ? '...' : 'Enregistrer'}
        </button>
      </div>

      {msg && <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

      <div className="space-y-4">
        {fields.map(key => (
          <div key={key} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{labels[key] || key}</label>
            {typeof params[key] === 'boolean' ? (
              <button onClick={() => setParams({...params, [key]: !params[key]})}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${params[key] ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'}`}>
                {params[key] ? '✅ Activé' : '❌ Désactivé'}
              </button>
            ) : (
              <input type="text" value={params[key] || ''} onChange={e => setParams({...params, [key]: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

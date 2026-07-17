import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

export const ParametresPage = () => {
  const [parametres, setParametres] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/parametres')
      .then(res => setParametres(res.data || {}))
      .catch(() => setMsg('Erreur chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/parametres', parametres);
      setMsg('✅ Paramètres sauvegardés');
    } catch { setMsg('❌ Erreur sauvegarde'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">⚙️ Paramètres</h2>
      {msg && <div className="mb-4 p-3 rounded-lg text-sm bg-green-100 text-green-700">{msg}</div>}
      <div className="space-y-4">
        {Object.entries(parametres).map(([key, value]: any) => (
          <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-xl border">
            <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">{key}</label>
            {typeof value === 'boolean' ? (
              <input type="checkbox" checked={value} onChange={e => setParametres({...parametres, [key]: e.target.checked})} />
            ) : (
              <input type="text" value={value} onChange={e => setParametres({...parametres, [key]: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            )}
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving}
        className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700">
        <Save size={18} /> {saving ? 'Sauvegarde...' : 'Enregistrer'}
      </button>
    </div>
  );
};

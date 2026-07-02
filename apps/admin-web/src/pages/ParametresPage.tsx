import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Settings, Save, CreditCard, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

const API = 'https://bygagoos-backend.onrender.com/api/v1';

export function ParametresPage() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { theme, setTheme } = useThemeStore();

  const { data: params } = useQuery({
    queryKey: ['parametres'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => r.data),
  });

  useEffect(() => {
    if (Array.isArray(params)) {
      const map: Record<string, string> = {};
      params.forEach((p: any) => { map[p.nom] = p.valeur; });
      setForm(map);
    }
  }, [params]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/parametres/general`, data),
    onSuccess: () => { setSaved(true); qc.invalidateQueries({ queryKey: ['parametres'] }); setTimeout(() => setSaved(false), 3000); },
  });

  const handleSave = () => saveMutation.mutate(form);

  const fields = [
    { key: 'abonnement_gratuit_max_motos', label: '🚀 Max motos (Gratuit)', type: 'number', desc: 'Nombre maximum de motos pour le plan gratuit' },
    { key: 'abonnement_2_5_prix_mensuel', label: '🥈 Prix mensuel 2-5 motos (Ar)', type: 'number', desc: 'Tarif pour 2 à 5 motos' },
    { key: 'abonnement_6_10_prix_mensuel', label: '🥇 Prix mensuel 6-10 motos (Ar)', type: 'number', desc: 'Tarif pour 6 à 10 motos' },
    { key: 'abonnement_11_plus_prix_mensuel', label: '💎 Prix mensuel 11+ motos (Ar)', type: 'number', desc: 'Tarif pour 11 motos et plus' },
    { key: 'reduction_annuelle_pourcent', label: '📉 Réduction annuelle (%)', type: 'number', desc: 'Pourcentage de réduction pour un abonnement annuel' },
  ];

  const themes = [
    { value: 'light', label: '☀️ Mode clair', icon: Sun },
    { value: 'dark', label: '🌙 Mode sombre', icon: Moon },
    { value: 'system', label: '💻 Système', icon: Monitor },
  ];

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Settings size={24} /> Paramètres</h1>
        <button onClick={handleSave} disabled={saveMutation.isPending} className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
          <Save size={16} /> {saved ? '✅ Sauvegardé !' : 'Enregistrer'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Abonnements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CreditCard size={20} /> Abonnements</h2>
          <div className="grid gap-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" />
                <p className="text-xs text-gray-400 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Thème */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Monitor size={20} /> Apparence</h2>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(t => {
              const Icon = t.icon;
              const isActive = theme === t.value;
              return (
                <button key={t.value} onClick={() => setTheme(t.value as any)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    isActive ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}>
                  <Icon size={24} className={`mx-auto mb-1 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

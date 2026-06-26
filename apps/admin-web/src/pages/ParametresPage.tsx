import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useThemeStore } from '../stores/themeStore';
import { Save, Palette, Calculator, RotateCcw, Sun, Moon, Monitor } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function ParametresPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useThemeStore();
  const [tab, setTab] = useState('general');
  const [msg, setMsg] = useState('');

  const { data: params } = useQuery({
    queryKey: ['parametres'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => r.data).catch(() => ({ prix_base: 2000, prix_km: 500, tarif_location_journalier: 15000, theme: 'clair' })),
  });

  const [prixBase, setPrixBase] = useState(2000);
  const [prixKm, setPrixKm] = useState(500);
  const [tarifLocation, setTarifLocation] = useState(15000);

  useEffect(() => {
    if (params) {
      setPrixBase(params.prix_base || 2000);
      setPrixKm(params.prix_km || 500);
      setTarifLocation(params.tarif_location_journalier || 15000);
    }
  }, [params]);

  const saveGeneral = useMutation({
    mutationFn: () => axios.post(`${API}/parametres/general`, { prix_base: prixBase, prix_km: prixKm, tarif_location_journalier: tarifLocation }),
    onSuccess: () => { setMsg('✅ Paramètres enregistrés'); queryClient.invalidateQueries({ queryKey: ['parametres'] }); },
  });

  const saveStyle = useMutation({
    mutationFn: () => axios.post(`${API}/parametres/style`, { theme, couleur_principale: '#DAA520' }),
    onSuccess: () => setMsg('✅ Style enregistré'),
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Paramètres</h1>
      {msg && <div className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 p-3 rounded-lg text-sm">{msg}</div>}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button onClick={() => setTab('general')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${tab === 'general' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <Calculator size={14} className="inline mr-1" /> Tarifs
        </button>
        <button onClick={() => setTab('style')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${tab === 'style' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <Palette size={14} className="inline mr-1" /> Apparence
        </button>
      </div>

      {/* TARIFS */}
      {tab === 'general' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-6">
          <h2 className="text-lg font-semibold">💰 Tarifs des courses</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500">🚖 Course normale</div>
              <div className="text-xl font-bold text-primary">{prixBase.toLocaleString()} Ar</div>
              <div className="text-xs text-gray-400">+ {prixKm} Ar/km</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500">🛺 Ady Varotra</div>
              <div className="text-xl font-bold text-primary">Libre</div>
              <div className="text-xs text-gray-400">Commission 20%</div>
            </div>
            <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 text-center border-2 border-green-500">
              <div className="text-xs text-gray-500">📅 Location/jour</div>
              <div className="text-xl font-bold text-green-600">{tarifLocation.toLocaleString()} Ar</div>
              <div className="text-xs text-green-500">Sans commission</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prix de base (Ar)</label>
            <input type="number" value={prixBase} onChange={e => setPrixBase(Number(e.target.value))} className="w-full max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix au km (Ar/km)</label>
            <input type="number" step="0.1" value={prixKm} onChange={e => setPrixKm(Number(e.target.value))} className="w-full max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tarif location journalière (Ar)</label>
            <input type="number" value={tarifLocation} onChange={e => setTarifLocation(Number(e.target.value))} className="w-full max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>

          <button onClick={() => saveGeneral.mutate()} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium">
            <Save size={16} /> Enregistrer les tarifs
          </button>

          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg text-sm">
            <strong>📱 Application Chauffeur - Calcul des courses :</strong>
            <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
              <li>🚖 Course normale = {prixBase.toLocaleString()} Ar + (km × {prixKm} Ar) - Commission 20%</li>
              <li>🛺 Ady Varotra = Montant libre - Commission 20%</li>
              <li>📅 Location journalière = {tarifLocation.toLocaleString()} Ar/jour - 0% commission</li>
            </ul>
          </div>
        </div>
      )}

      {/* APPARENCE */}
      {tab === 'style' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-6">
          <h2 className="text-lg font-semibold">🎨 Apparence</h2>
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => setTheme('light')} className={`p-6 rounded-xl border-2 text-center transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-600'}`}>
              <Sun size={32} className={`mx-auto mb-2 ${theme === 'light' ? 'text-primary' : 'text-gray-400'}`} />
              <div className={`font-medium ${theme === 'light' ? 'text-primary' : 'text-gray-500'}`}>Clair</div>
            </button>
            <button onClick={() => setTheme('dark')} className={`p-6 rounded-xl border-2 text-center transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-600'}`}>
              <Moon size={32} className={`mx-auto mb-2 ${theme === 'dark' ? 'text-primary' : 'text-gray-400'}`} />
              <div className={`font-medium ${theme === 'dark' ? 'text-primary' : 'text-gray-500'}`}>Sombre</div>
            </button>
            <button onClick={() => setTheme('system')} className={`p-6 rounded-xl border-2 text-center transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-600'}`}>
              <Monitor size={32} className={`mx-auto mb-2 ${theme === 'system' ? 'text-primary' : 'text-gray-400'}`} />
              <div className={`font-medium ${theme === 'system' ? 'text-primary' : 'text-gray-500'}`}>Système</div>
            </button>
          </div>
          <button onClick={() => saveStyle.mutate()} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium">
            <Save size={16} /> Appliquer
          </button>
        </div>
      )}
    </div>
  );
}

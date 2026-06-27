import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Save, Play, Check, Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const tousTypes = [
  { value: 'NORMALE', label: '🚖 Course normale', desc: 'Tarif calculé au km' },
  { value: 'ADY_VAROTRA', label: '🛺 Ady Varotra', desc: 'Montant libre' },
  { value: 'LOCATION_JOURNALIERE', label: '📅 Location journalière', desc: 'Tarif fixe admin' },
];

export function ParametresPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useThemeStore();
  const [tab, setTab] = useState('general');
  const [msg, setMsg] = useState('');

  const { data: params } = useQuery({
    queryKey: ['parametres'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => r.data),
  });

  const { data: typesData } = useQuery({
    queryKey: ['types-autorises'],
    queryFn: () => axios.get(`${API}/parametres/types-autorises`).then(r => r.data),
  });

  const { data: coupEnvoiData } = useQuery({
    queryKey: ['coup-envoi'],
    queryFn: () => axios.get(`${API}/parametres/coup-envoi`).then(r => r.data),
  });

  const [prixBase, setPrixBase] = useState(2000);
  const [prixKm, setPrixKm] = useState(500);
  const [tarifLocation, setTarifLocation] = useState(15000);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['NORMALE', 'ADY_VAROTRA', 'LOCATION_JOURNALIERE']);
  const [heureEnvoi, setHeureEnvoi] = useState('07:00');

  useEffect(() => {
    if (params) {
      setPrixBase(params.prix_base || 2000);
      setPrixKm(params.prix_km || 500);
      setTarifLocation(params.tarif_location_journalier || 15000);
    }
  }, [params]);

  useEffect(() => {
    if (typesData?.types) setSelectedTypes(typesData.types);
  }, [typesData]);

  useEffect(() => {
    if (coupEnvoiData?.heure) setHeureEnvoi(coupEnvoiData.heure);
  }, [coupEnvoiData]);

  const saveGeneral = useMutation({
    mutationFn: () => axios.post(`${API}/parametres/general`, { prix_base: prixBase, prix_km: prixKm, tarif_location_journalier: tarifLocation }),
    onSuccess: () => setMsg('✅ Tarifs enregistrés'),
  });

  const saveTypes = useMutation({
    mutationFn: () => axios.post(`${API}/parametres/types-autorises`, { types: selectedTypes }),
    onSuccess: () => setMsg('✅ Types enregistrés'),
  });

  const lancerCoupEnvoi = useMutation({
    mutationFn: () => axios.post(`${API}/parametres/coup-envoi`, { types: selectedTypes, heure: heureEnvoi }),
    onSuccess: (res: any) => {
      setMsg('🏁 ' + (res.data?.message || 'Coup d\'envoi lancé !'));
      queryClient.invalidateQueries({ queryKey: ['coup-envoi'] });
    },
  });

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Paramètres</h1>
      {msg && <div className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 p-3 rounded-lg text-sm">{msg}</div>}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 flex-wrap">
        <button onClick={() => setTab('general')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${tab === 'general' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>💰 Tarifs</button>
        <button onClick={() => setTab('types')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${tab === 'types' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>🏷️ Types de courses</button>
        <button onClick={() => setTab('coup-envoi')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${tab === 'coup-envoi' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>🏁 Coup d'envoi</button>
        <button onClick={() => setTab('apparence')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${tab === 'apparence' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>🎨 Apparence</button>
      </div>

      {/* TARIFS */}
      {tab === 'general' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">💰 Tarifs des courses</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
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
              <div className="text-xs text-green-500">0% commission</div>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Prix de base (Ar)</label><input type="number" value={prixBase} onChange={e => setPrixBase(Number(e.target.value))} className="w-full max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-700" /></div>
          <div><label className="block text-sm font-medium mb-1">Prix au km (Ar/km)</label><input type="number" step="0.1" value={prixKm} onChange={e => setPrixKm(Number(e.target.value))} className="w-full max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-700" /></div>
          <div><label className="block text-sm font-medium mb-1">Tarif location (Ar/jour)</label><input type="number" value={tarifLocation} onChange={e => setTarifLocation(Number(e.target.value))} className="w-full max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-700" /></div>
          <button onClick={() => saveGeneral.mutate()} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium"><Save size={16} /> Enregistrer</button>
        </div>
      )}

      {/* TYPES DE COURSES */}
      {tab === 'types' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">🏷️ Types de courses autorisés</h2>
          <p className="text-sm text-gray-500">Sélectionnez les types que les chauffeurs pourront utiliser aujourd'hui.</p>
          <div className="space-y-3">
            {tousTypes.map(t => (
              <label key={t.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedTypes.includes(t.value) ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-600'
              }`}>
                <input type="checkbox" checked={selectedTypes.includes(t.value)} onChange={() => toggleType(t.value)}
                  className="w-5 h-5 accent-primary" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </div>
                {selectedTypes.includes(t.value) && <Check size={18} className="text-primary ml-auto" />}
              </label>
            ))}
          </div>
          <button onClick={() => saveTypes.mutate()} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium"><Save size={16} /> Enregistrer les types</button>
        </div>
      )}

      {/* COUP D'ENVOI */}
      {tab === 'coup-envoi' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">🏁 Coup d'envoi</h2>
          <p className="text-sm text-gray-500">Lancez le coup d'envoi pour réinitialiser les pointages et définir les types de courses du jour.</p>
          
          {coupEnvoiData?.actif && (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4">
              <p className="text-green-700 dark:text-green-300 text-sm">✅ Coup d'envoi actif à <strong>{coupEnvoiData.heure}</strong></p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Types autorisés pour aujourd'hui :</p>
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map(t => (
                <span key={t} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {tousTypes.find(tt => tt.value === t)?.label || t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Heure du coup d'envoi</label>
            <input type="time" value={heureEnvoi} onChange={e => setHeureEnvoi(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-700" />
          </div>

          <button onClick={() => { if (confirm('Lancer le coup d\'envoi ? Cela réinitialisera tous les pointages du jour.')) lancerCoupEnvoi.mutate(); }}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600">
            <Play size={18} /> Lancer le coup d'envoi
          </button>
        </div>
      )}

      {/* APPARENCE */}
      {tab === 'apparence' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">🎨 Apparence</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light' as const, icon: Sun, label: 'Clair' },
              { value: 'dark' as const, icon: Moon, label: 'Sombre' },
              { value: 'system' as const, icon: Monitor, label: 'Système' },
            ].map(t => (
              <button key={t.value} onClick={() => setTheme(t.value)}
                className={`p-6 rounded-xl border-2 text-center transition-all ${theme === t.value ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-600'}`}>
                <t.icon size={32} className={`mx-auto mb-2 ${theme === t.value ? 'text-primary' : 'text-gray-400'}`} />
                <div className={`font-medium ${theme === t.value ? 'text-primary' : 'text-gray-500'}`}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

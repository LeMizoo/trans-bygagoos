import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Settings, Save, DollarSign, Bike } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function ParametresPage() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    prix_base: '2000',
    prix_km: '500',
    tarif_location_journalier: '15000',
    commission: '20',
  });

  // Charger les paramètres depuis l'API
  const { data: pricing } = useQuery({
    queryKey: ['parametres'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => r.data),
  });

  // Initialiser le formulaire avec les valeurs de l'API
  useState(() => {
    if (pricing) {
      setForm({
        prix_base: pricing.prix_base || '2000',
        prix_km: pricing.prix_km || '500',
        tarif_location_journalier: pricing.tarif_location_journalier || '15000',
        commission: pricing.commission || '20',
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/parametres/general`, data),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ['parametres'] });
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      prix_base: parseInt(form.prix_base),
      prix_km: parseFloat(form.prix_km),
      tarif_location_journalier: parseInt(form.tarif_location_journalier),
      commission: parseInt(form.commission),
    });
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Settings size={24} className="text-primary" /> Paramètres
      </h1>

      {saved && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">✅ Paramètres enregistrés !</div>
      )}

      {/* Versements journaliers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><DollarSign size={20} />💰 Versements journaliers</h2>
            <p className="text-xs text-gray-500 mb-4">Montant que chaque chauffeur doit ramener au garage par jour.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">🏍️ Taxi Moto (Ar/jour)</label>
                <input type="number" value={form.versement_moto} onChange={e => setForm({...form, versement_moto: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">🚗 Taxi (Ar/jour)</label>
                <input type="number" value={form.versement_taxi} onChange={e => setForm({...form, versement_taxi: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">🚌 Bus (Ar/jour)</label>
                <input type="number" value={form.versement_bus} onChange={e => setForm({...form, versement_bus: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
            </div>
          </div>

          {/* Tarifs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <DollarSign size={20} className="text-primary" /> Tarifs des courses
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Prix de base (Ar)</label>
            <input type="number" value={form.prix_base} onChange={e => setForm({ ...form, prix_base: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <p className="text-[10px] text-gray-400 mt-1">Tarif minimum pour une course normale</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Prix par km (Ar)</label>
            <input type="number" step="0.1" value={form.prix_km} onChange={e => setForm({ ...form, prix_km: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <p className="text-[10px] text-gray-400 mt-1">Tarif kilométrique</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Location journalière (Ar)</label>
            <input type="number" value={form.tarif_location_journalier} onChange={e => setForm({ ...form, tarif_location_journalier: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <p className="text-[10px] text-gray-400 mt-1">Tarif pour une location à la journée</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Commission (%)</label>
            <input type="number" value={form.commission} onChange={e => setForm({ ...form, commission: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <p className="text-[10px] text-gray-400 mt-1">Pourcentage retenu par la plateforme</p>
          </div>
        </div>

        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
          <Save size={14} /> {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {/* Exemple de calcul */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Bike size={20} className="text-green-500" /> Exemple de calcul
        </h2>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm space-y-2">
          <p>📏 <strong>Course de 10 km</strong></p>
          <p>💰 Prix de base : <strong>{parseInt(form.prix_base).toLocaleString()} Ar</strong></p>
          <p>📐 Kilométrage : 10 × {parseFloat(form.prix_km).toLocaleString()} = <strong>{(10 * parseFloat(form.prix_km)).toLocaleString()} Ar</strong></p>
          <p>🧾 Total course : <strong>{(parseInt(form.prix_base) + 10 * parseFloat(form.prix_km)).toLocaleString()} Ar</strong></p>
          <p>💸 Commission ({form.commission}%) : <strong>{Math.round((parseInt(form.prix_base) + 10 * parseFloat(form.prix_km)) * parseInt(form.commission) / 100).toLocaleString()} Ar</strong></p>
          <p>📤 Gain chauffeur : <strong>{Math.round((parseInt(form.prix_base) + 10 * parseFloat(form.prix_km)) * (100 - parseInt(form.commission)) / 100).toLocaleString()} Ar</strong></p>
        </div>
      </div>
    </div>
  );
}

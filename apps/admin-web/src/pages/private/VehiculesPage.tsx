import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bike, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

export const VehiculesPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [vehicules, setVehicules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vehicules').then(res => {
      let data = Array.isArray(res.data) ? res.data : [];
      if (type === 'FLOTTE') data = data.filter((v: any) => v.coop?.nom?.toLowerCase().includes('flotte'));
      else if (type === 'COOP') data = data.filter((v: any) => v.coop?.nom?.toLowerCase().includes('coop'));
      setVehicules(data);
    }).finally(() => setLoading(false));
  }, [type]);

  const title = type === 'FLOTTE' ? '🏍️ Véhicules Flotte' : type === 'COOP' ? '📦 Véhicules Coop' : '🏍️ Tous les véhicules';

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-500 text-sm mt-1">{vehicules.length} véhicule(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700 text-left">
              <th className="py-3 px-4 font-medium">Immatriculation</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Modèle</th>
              <th className="py-3 px-4 font-medium">Coopérative</th>
              <th className="py-3 px-4 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {vehicules.map(v => (
              <tr key={v.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4 font-medium">{v.immatriculation}</td>
                <td className="py-3 px-4">{v.type}</td>
                <td className="py-3 px-4">{v.modele}</td>
                <td className="py-3 px-4">{v.coop?.nom || '-'}</td>
                <td className="py-3 px-4">{v.statut === 'DISPONIBLE' ? <span className="text-green-500 flex items-center gap-1"><CheckCircle size={14} /> Dispo</span> : <span className="text-orange-500 flex items-center gap-1"><AlertCircle size={14} /> {v.statut}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

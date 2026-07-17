import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Bike, Car, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

const typeIcons: any = { MOTO: Bike, VOITURE: Car, CAMIONNETTE: Truck };

export const VehiculesPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [vehicules, setVehicules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/vehicules').then(res => {
      let data = Array.isArray(res.data) ? res.data : [];
      if (type === 'FLOTTE') data = data.filter((v: any) => v.coop?.nom?.toLowerCase().includes('flotte') || v.coop?.nom?.toLowerCase().includes('taxi'));
      else if (type === 'COOP') data = data.filter((v: any) => !v.coop?.nom?.toLowerCase().includes('flotte') && !v.coop?.nom?.toLowerCase().includes('taxi'));
      setVehicules(data);
    }).finally(() => setLoading(false));
  }, [type]);

  const filtered = vehicules.filter(v => v.immatriculation?.toLowerCase().includes(search.toLowerCase()) || v.modele?.toLowerCase().includes(search.toLowerCase()));
  const title = type === 'FLOTTE' ? '🏍️ Motos Flotte' : type === 'COOP' ? '🚛 Véhicules Coop' : '🏍️ Tous les véhicules';

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-500 mt-1">{filtered.length} véhicule(s)</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-4 px-6 font-semibold text-sm">Véhicule</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Type</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Coopérative</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Chauffeur</th>
                <th className="text-center py-4 px-6 font-semibold text-sm">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(v => {
                const Icon = typeIcons[v.type] || Bike;
                return (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><Icon size={18} /></div>
                        <div>
                          <div className="font-bold font-mono">{v.immatriculation}</div>
                          <div className="text-xs text-gray-400">{v.modele}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">{v.type}</span></td>
                    <td className="py-4 px-6 text-sm">{v.coop?.nom || '-'}</td>
                    <td className="py-4 px-6 text-sm">{v.livreur?.nom || <span className="text-gray-400">-</span>}</td>
                    <td className="py-4 px-6 text-center">
                      {v.statut === 'DISPONIBLE' ? <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm"><CheckCircle size={16} /> Disponible</span>
                        : <span className="inline-flex items-center gap-1 text-orange-500 font-medium text-sm"><AlertCircle size={16} /> {v.statut}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

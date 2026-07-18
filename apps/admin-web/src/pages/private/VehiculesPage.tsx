import React, { useState, useEffect } from 'react';
import { Search, Bike, Truck, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { api } from '../../api/client';

export const VehiculesPage = () => {
  const [motos, setMotos] = useState<any[]>([]);
  const [vehicules, setVehicules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'TOUS' | 'MOTOS' | 'VEHICULES'>('TOUS');

  useEffect(() => {
    Promise.all([
      api.get('/flottes').then(r => {
        const allMotos: any[] = [];
        (Array.isArray(r.data) ? r.data : []).forEach((f: any) => {
          (f.motos || []).forEach((m: any) => allMotos.push({ ...m, flotte: f.nom, type: 'MOTO' }));
        });
        return allMotos;
      }),
      api.get('/coops').then(r => {
        const allVehicules: any[] = [];
        (Array.isArray(r.data) ? r.data : []).forEach((c: any) => {
          (c.vehicules || []).forEach((v: any) => allVehicules.push({ ...v, cooperative: c.nom, type: 'VEHICULE' }));
        });
        return allVehicules;
      })
    ]).then(([m, v]) => {
      setMotos(m);
      setVehicules(v);
    }).finally(() => setLoading(false));
  }, []);

  const allVehicules = [...motos, ...vehicules];
  
  const filtered = allVehicules.filter(v => {
    const matchSearch = (v.marque + v.modele + v.immatriculation).toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'TOUS' || v.type === (tab === 'MOTOS' ? 'MOTO' : 'VEHICULE');
    return matchSearch && matchTab;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">🚛 Véhicules</h2>
          <p className="text-gray-500 mt-1">{motos.length} motos · {vehicules.length} véhicules</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-56" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'TOUS', label: '📋 Tous', count: allVehicules.length },
          { key: 'MOTOS', label: '🏍️ Motos', count: motos.length },
          { key: 'VEHICULES', label: '🚛 Véhicules', count: vehicules.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 border hover:bg-gray-50'
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border">
          <Truck size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">Aucun véhicule trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(v => (
            <div key={v.id || v.immatriculation} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    v.type === 'MOTO' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {v.type === 'MOTO' ? <Bike size={24} className="text-orange-600" /> : <Truck size={24} className="text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{v.marque} {v.modele}</h3>
                    <span className="text-xs font-mono text-gray-500">{v.immatriculation}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  v.statut === 'ACTIF' || v.statut === 'DISPONIBLE'
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {v.statut || 'ACTIF'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-xs">📅</span> Année {v.annee || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={14} />
                  {v.flotte || v.cooperative || 'Non assigné'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    {v.type === 'MOTO' ? '🏍️' : '🚛'} {v.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

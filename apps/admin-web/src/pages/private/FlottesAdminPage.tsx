import React, { useState, useEffect } from 'react';
import { Building2, Users, Bike, Phone, MapPin, Search } from 'lucide-react';
import { api } from '../../api/client';

export const FlottesAdminPage = () => {
  const [flottes, setFlottes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/coops').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setFlottes(data.filter((c: any) => c.nom?.toLowerCase().includes('flotte') || c.nom?.toLowerCase().includes('taxi')));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = flottes.filter(f => f.nom?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">🏍️ Flottes</h2>
          <p className="text-gray-500 mt-1">{flottes.length} flotte(s) de taxi-motos</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(f => (
          <div key={f.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-xl flex items-center justify-center">
                <Building2 size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
              <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">ACTIF</span>
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-orange-600 transition-colors">{f.nom}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{f.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg"><Users size={14} /> {f.livreurs?.length || 0} chauffeurs</span>
              <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg"><Bike size={14} /> {f.vehicules?.length || 0} motos</span>
              <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg"><Phone size={14} /> {f.telephone || '-'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

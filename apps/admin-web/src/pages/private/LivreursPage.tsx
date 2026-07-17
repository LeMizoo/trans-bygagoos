import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, User, Bike, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';
import { api } from '../../api/client';

export const LivreursPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/livreurs').then(res => {
      let data = Array.isArray(res.data) ? res.data : [];
      if (type === 'FLOTTE') data = data.filter((l: any) => l.coop?.nom?.toLowerCase().includes('flotte') || l.coop?.nom?.toLowerCase().includes('taxi'));
      else if (type === 'COOP') data = data.filter((l: any) => !l.coop?.nom?.toLowerCase().includes('flotte') && !l.coop?.nom?.toLowerCase().includes('taxi'));
      setLivreurs(data);
    }).finally(() => setLoading(false));
  }, [type]);

  const filtered = livreurs.filter(l => l.nom?.toLowerCase().includes(search.toLowerCase()));
  const title = type === 'FLOTTE' ? '🏍️ Chauffeurs Flotte' : type === 'COOP' ? '📦 Livreurs Coop' : '👤 Tous les livreurs';
  const colors = ['from-indigo-500 to-blue-600', 'from-green-500 to-emerald-600', 'from-orange-500 to-amber-600', 'from-purple-500 to-pink-600', 'from-cyan-500 to-teal-600'];

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-500 mt-1">{filtered.length} livreur(s) · {filtered.filter(l => l.actif).length} actif(s)</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un livreur..."
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((l, i) => (
          <div key={l.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group">
            <div className="flex flex-col items-center text-center mb-4">
              <div className={`bg-gradient-to-br ${colors[i % colors.length]} w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg`}>
                {l.nom?.charAt(0)}
              </div>
              <h3 className="font-bold text-lg">{l.nom}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{l.coop?.nom || '-'}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-500"><Mail size={14} /> {l.email}</div>
              <div className="flex items-center gap-2 text-gray-500"><Bike size={14} /> {l.vehicule?.immatriculation || <span className="text-gray-400 italic">Non assigné</span>}</div>
              <div className="flex items-center gap-2">
                {l.actif ? <span className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle size={16} /> Actif</span>
                        : <span className="text-red-500 flex items-center gap-1 font-medium"><XCircle size={16} /> Inactif</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

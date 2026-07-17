import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, Truck, MapPin, User } from 'lucide-react';
import { api } from '../../api/client';

const statutConfig: any = {
  EN_ATTENTE: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'En attente' },
  EN_COURS: { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100', label: 'En cours' },
  LIVREE: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Livrée' },
};

export const CommandesPage = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/commandes').then(res => setCommandes(Array.isArray(res.data) ? res.data : [])).finally(() => setLoading(false));
  }, []);

  const filtered = commandes.filter(c => c.client?.toLowerCase().includes(search.toLowerCase()) || c.adresse?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📦 Commandes</h2>
          <p className="text-gray-500 mt-1">{filtered.length} commande(s)</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client..."
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-4 px-6 font-semibold text-sm">N° Commande</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Client</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Adresse</th>
                <th className="text-right py-4 px-6 font-semibold text-sm">Montant</th>
                <th className="text-center py-4 px-6 font-semibold text-sm">Statut</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(c => {
                const st = statutConfig[c.statut] || statutConfig.EN_ATTENTE;
                const StatusIcon = st.icon;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-sm">#{c.id?.slice(-8)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /> {c.client || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> {c.adresse || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold">{(c.prix || 0).toLocaleString()} Ar</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${st.bg} ${st.color}`}>
                        <StatusIcon size={14} /> {st.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
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

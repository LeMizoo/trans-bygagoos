import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, Truck, MapPin, User, DollarSign, Package } from 'lucide-react';
import { api } from '../../api/client';

const statutConfig: any = {
  EN_ATTENTE: { icon: Clock, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'En attente' },
  EN_COURS: { icon: Truck, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'En cours' },
  LIVREE: { icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Livrée' },
};

export const CommandesPage = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('TOUS');

  useEffect(() => {
    api.get('/commandes').then(res => {
      setCommandes(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = commandes.filter(c => {
    const matchSearch = (c.reference + c.description + c.user?.nom).toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'TOUS' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const enAttente = commandes.filter(c => c.statut === 'EN_ATTENTE').length;
  const enCours = commandes.filter(c => c.statut === 'EN_COURS').length;
  const livrees = commandes.filter(c => c.statut === 'LIVREE').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Suivi des commandes</h2>
          <p className="text-gray-500 mt-1">{commandes.length} commande(s)</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." 
              className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-48" />
          </div>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm">
            <option value="TOUS">Tous</option>
            <option value="EN_ATTENTE">🟡 En attente</option>
            <option value="EN_COURS">🔵 En cours</option>
            <option value="LIVREE">🟢 Livrées</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'En attente', value: enAttente, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'En cours', value: enCours, color: 'bg-blue-100 text-blue-700' },
          { label: 'Livrées', value: livrees, color: 'bg-green-100 text-green-700' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border text-center">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${s.color}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const cfg = statutConfig[c.statut] || statutConfig.EN_ATTENTE;
            return (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                      <cfg.icon size={20} />
                    </div>
                    <div>
                      <div className="font-bold">{c.reference}</div>
                      <div className="text-sm text-gray-500">{c.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{(c.prix || 0).toLocaleString()} Ar</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><User size={12} /> {c.user?.nom || 'N/A'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

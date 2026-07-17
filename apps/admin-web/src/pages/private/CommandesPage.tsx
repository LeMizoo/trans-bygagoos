import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, Truck, MapPin, User, DollarSign, Calendar } from 'lucide-react';
import { api } from '../../api/client';

const statutSteps = ['EN_ATTENTE', 'EN_COURS', 'LIVREE'];
const statutConfig: any = {
  EN_ATTENTE: { icon: Clock, color: 'text-yellow-500 bg-yellow-100', label: 'En attente', step: 0 },
  EN_COURS: { icon: Truck, color: 'text-blue-500 bg-blue-100', label: 'En cours', step: 1 },
  LIVREE: { icon: CheckCircle, color: 'text-green-500 bg-green-100', label: 'Livrée', step: 2 },
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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📦 Suivi des commandes</h2>
          <p className="text-gray-500 mt-1">{filtered.length} commande(s) · {filtered.filter(c => c.statut === 'LIVREE').length} livrée(s)</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(c => {
          const st = statutConfig[c.statut] || statutConfig.EN_ATTENTE;
          const StatusIcon = st.icon;
          return (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${st.color} flex items-center justify-center`}>
                    <StatusIcon size={20} />
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm">#{c.id?.slice(-8)}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} /> {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr') : '-'}</div>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${st.color}`}>{st.label}</span>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 mb-4 px-2">
                {statutSteps.map((step, i) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`w-3 h-3 rounded-full ${i <= st.step ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {i < statutSteps.length - 1 && <div className={`flex-1 h-0.5 ${i < st.step ? 'bg-green-500' : 'bg-gray-300'}`} />}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-500"><User size={15} /> <span className="font-medium text-gray-700 dark:text-gray-200">{c.client || '-'}</span></div>
                <div className="flex items-center gap-2 text-gray-500"><MapPin size={15} /> {c.adresse || '-'}</div>
                <div className="flex items-center gap-2 text-gray-500"><DollarSign size={15} /> <span className="font-bold text-lg">{(c.prix || 0).toLocaleString()} Ar</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

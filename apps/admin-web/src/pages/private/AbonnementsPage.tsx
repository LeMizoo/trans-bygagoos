import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Calendar, DollarSign, Edit3, Bell, Filter, ArrowUpDown } from 'lucide-react';
import { api } from '../../api/client';

export const AbonnementsPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('nom');
  const [filterStatut, setFilterStatut] = useState('TOUS');

  useEffect(() => {
    api.get('/abonnements').then(res => {
      let data = Array.isArray(res.data) ? res.data : [];
      if (type !== 'TOUS') data = data.filter((a: any) => a.type === type);
      setAbonnements(data);
    }).finally(() => setLoading(false));
  }, [type]);

  const filtered = abonnements
    .filter(a => filterStatut === 'TOUS' || a.statut === filterStatut)
    .sort((a, b) => {
      if (sort === 'prix') return (b.prix || 0) - (a.prix || 0);
      if (sort === 'fin') return (a.fin || '').localeCompare(b.fin || '');
      return (a.nom || '').localeCompare(b.nom || '');
    });

  const title = type === 'FLOTTE' ? '🏍️ Abonnements Flottes' : type === 'COOP' ? '📦 Abonnements Coops' : '💳 Tous les abonnements';

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-500 mt-1">{filtered.length} abonnement(s)</p>
        </div>
        <div className="flex gap-2">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
            <option value="nom">Trier par nom</option>
            <option value="prix">Trier par prix</option>
            <option value="fin">Trier par échéance</option>
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="INACTIF">Inactifs</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left py-4 px-6 font-semibold text-sm">Client</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Formule</th>
              <th className="text-right py-4 px-6 font-semibold text-sm">Prix/mois</th>
              <th className="text-center py-4 px-6 font-semibold text-sm">Statut</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Échéance</th>
              <th className="text-center py-4 px-6 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-4 px-6"><div className="font-bold">{a.nom}</div></td>
                <td className="py-4 px-6 font-medium">{a.formule}</td>
                <td className="py-4 px-6 text-right font-bold text-lg">{a.prix?.toLocaleString?.() ?? a.prix} Ar</td>
                <td className="py-4 px-6 text-center">
                  <button onClick={() => alert(`Changer statut de ${a.nom}`)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity ${a.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {a.statut}
                  </button>
                </td>
                <td className="py-4 px-6 text-sm text-gray-500"><Calendar size={14} className="inline mr-1" />{a.fin}</td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => alert(`Modifier ${a.nom}`)} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-600 transition-colors" title="Modifier">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => alert(`Notifier ${a.nom}`)} className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg text-amber-600 transition-colors" title="Notifier">
                      <Bell size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

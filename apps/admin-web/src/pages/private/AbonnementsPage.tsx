import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Calendar, DollarSign } from 'lucide-react';
import { api } from '../../api/client';

export const AbonnementsPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = type === 'TOUS' ? '/abonnements' : `/abonnements?type=${type}`;
    api.get(url).then(res => setAbonnements(Array.isArray(res.data) ? res.data : [])).finally(() => setLoading(false));
  }, [type]);

  const title = type === 'FLOTTE' ? '🏍️ Abonnements Flottes' : type === 'COOP' ? '📦 Abonnements Coops' : '💳 Tous les abonnements';

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-gray-500 mt-1">{abonnements.length} abonnement(s)</p>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left py-4 px-6 font-semibold text-sm">Client</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Type</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Formule</th>
              <th className="text-right py-4 px-6 font-semibold text-sm">Prix/mois</th>
              <th className="text-center py-4 px-6 font-semibold text-sm">Statut</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Échéance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {abonnements.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold">{a.nom}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{a.vehiculesMax || 0} véhicules max</div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.type === 'FLOTTE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {a.type}
                  </span>
                </td>
                <td className="py-4 px-6 font-medium">{a.formule}</td>
                <td className="py-4 px-6 text-right font-bold text-lg">{a.prix?.toLocaleString?.() ?? a.prix} Ar</td>
                <td className="py-4 px-6 text-center">
                  {a.statut === 'ACTIF' ? (
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm"><CheckCircle size={16} /> Actif</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 font-medium text-sm"><XCircle size={16} /> {a.statut}</span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5"><Calendar size={14} /> {a.fin}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

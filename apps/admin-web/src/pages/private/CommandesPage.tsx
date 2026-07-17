import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { api } from '../../api/client';

export const CommandesPage = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/commandes').then(res => {
      setCommandes(Array.isArray(res.data) ? res.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const statutIcon = (s: string) => {
    if (s === 'LIVREE') return <CheckCircle size={14} className="text-green-500" />;
    if (s === 'EN_COURS') return <Truck size={14} className="text-orange-500" />;
    return <Clock size={14} className="text-gray-400" />;
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">📦 Commandes</h2>
        <p className="text-gray-500 text-sm mt-1">{commandes.length} commande(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700 text-left">
              <th className="py-3 px-4 font-medium">N°</th>
              <th className="py-3 px-4 font-medium">Client</th>
              <th className="py-3 px-4 font-medium">Adresse</th>
              <th className="py-3 px-4 font-medium">Prix</th>
              <th className="py-3 px-4 font-medium">Statut</th>
              <th className="py-3 px-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map(c => (
              <tr key={c.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4 font-medium">{c.id?.slice(-6)}</td>
                <td className="py-3 px-4">{c.client || '-'}</td>
                <td className="py-3 px-4 text-gray-500">{c.adresse || '-'}</td>
                <td className="py-3 px-4">{c.prix?.toLocaleString?.() ?? '-'} Ar</td>
                <td className="py-3 px-4 flex items-center gap-1">{statutIcon(c.statut)} {c.statut}</td>
                <td className="py-3 px-4 text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

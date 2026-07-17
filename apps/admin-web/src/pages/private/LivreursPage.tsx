import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Bike, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../api/client';

export const LivreursPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/livreurs').then(res => {
      let data = Array.isArray(res.data) ? res.data : [];
      if (type === 'FLOTTE') data = data.filter((l: any) => l.coop?.nom?.toLowerCase().includes('flotte'));
      else if (type === 'COOP') data = data.filter((l: any) => l.coop?.nom?.toLowerCase().includes('coop'));
      setLivreurs(data);
    }).finally(() => setLoading(false));
  }, [type]);

  const title = type === 'FLOTTE' ? '🏍️ Livreurs Flotte' : type === 'COOP' ? '📦 Livreurs Coop' : '👤 Tous les livreurs';

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-500 text-sm mt-1">{livreurs.length} livreur(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700 text-left">
              <th className="py-3 px-4 font-medium">Nom</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Coopérative</th>
              <th className="py-3 px-4 font-medium">Véhicule</th>
              <th className="py-3 px-4 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {livreurs.map(l => (
              <tr key={l.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4 font-medium">{l.nom}</td>
                <td className="py-3 px-4 text-gray-500">{l.email}</td>
                <td className="py-3 px-4">{l.coop?.nom || '-'}</td>
                <td className="py-3 px-4">{l.vehicule?.immatriculation || '-'}</td>
                <td className="py-3 px-4">{l.actif ? <span className="text-green-500 flex items-center gap-1"><CheckCircle size={14} /> Actif</span> : <span className="text-red-500 flex items-center gap-1"><XCircle size={14} /> Inactif</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

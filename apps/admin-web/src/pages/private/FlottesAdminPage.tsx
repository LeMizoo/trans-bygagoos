import React, { useState, useEffect } from 'react';
import { Search, Building2, Users, Bike, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../api/client';

export const FlottesAdminPage = () => {
  const [flottes, setFlottes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/coops')
      .then(res => setFlottes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">🏢 Flottes & Coopératives</h2>
      <div className="grid gap-4">
        {flottes.map((f: any) => (
          <div key={f.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{f.nom}</h3>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Actif</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">{f.description}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2"><Users size={16} className="text-gray-400" /> <span>{f.livreurs?.length || 0} livreurs</span></div>
              <div className="flex items-center gap-2"><Bike size={16} className="text-gray-400" /> <span>{f.vehicules?.length || 0} véhicules</span></div>
              <div className="flex items-center gap-2">📞 <span>{f.telephone || '-'}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

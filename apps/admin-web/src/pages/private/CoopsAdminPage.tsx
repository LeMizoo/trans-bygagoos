import React, { useState, useEffect } from 'react';
import { Package, Users, Bike, Phone } from 'lucide-react';
import { api } from '../../api/client';

export const CoopsAdminPage = () => {
  const [coops, setCoops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/coops').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setCoops(data.filter((c: any) => !c.nom?.toLowerCase().includes('flotte')));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">📦 Coopératives</h2>
        <p className="text-gray-500 text-sm mt-1">Gestion des coopératives de livraison</p>
      </div>
      <div className="grid gap-4">
        {coops.map(c => (
          <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{c.nom}</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Actif</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">{c.description}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <span><Users size={14} className="inline mr-1" /> {c.livreurs?.length || 0} livreurs</span>
              <span><Bike size={14} className="inline mr-1" /> {c.vehicules?.length || 0} véhicules</span>
              <span><Phone size={14} className="inline mr-1" /> {c.telephone || '-'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

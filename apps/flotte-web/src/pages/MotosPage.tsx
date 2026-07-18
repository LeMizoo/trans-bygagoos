import React, { useState, useEffect } from 'react';
import { Bike, Search } from 'lucide-react';
import { api } from '../api/client';

export function MotosPage() {
  const [motos, setMotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const flotteId = user.flotteId || user.flotte?.id;
    if (flotteId) {
      api.get('/flottes/' + flotteId).then(function(res) {
        setMotos(res.data.motos || []);
      }).finally(function() { setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">🏍️ Motos</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Rechercher..." className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 w-48" />
        </div>
      </div>
      <p className="text-gray-500 mb-4">{motos.length} moto(s)</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {motos.map(function(m: any) {
          return (
            <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Bike size={24} className="text-orange-600" />
              </div>
              <div>
                <div className="font-bold">{m.marque} {m.modele}</div>
                <div className="text-sm text-gray-500">{m.immatriculation} · {m.annee}</div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{m.statut || 'ACTIF'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

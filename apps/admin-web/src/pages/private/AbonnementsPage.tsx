import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../api/client';

export const AbonnementsPage = () => {
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('TOUS');

  useEffect(() => {
    const url = filtre === 'TOUS' ? '/abonnements' : `/abonnements?type=${filtre}`;
    api.get(url)
      .then(res => setAbonnements(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filtre]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">💳 Abonnements</h2>
      <div className="flex gap-2 mb-6">
        {['TOUS', 'FLOTTE', 'COOP'].map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filtre === f ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
            {f === 'TOUS' ? 'Tous' : f === 'FLOTTE' ? '🏍️ Flottes' : '📦 Coops'}
          </button>
        ))}
      </div>
      {loading ? <p className="text-gray-400">Chargement...</p> : (
        <div className="grid gap-4">
          {abonnements.map((a: any) => (
            <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{a.nom}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {a.statut}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                <span>Type : {a.type}</span>
                <span>Formule : {a.formule}</span>
                <span>Prix : {a.prix?.toLocaleString?.() ?? a.prix} Ar/mois</span>
                <span>Véhicules max : {a.vehiculesMax ?? '-'}</span>
                <span>Début : {a.debut}</span>
                <span>Fin : {a.fin}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

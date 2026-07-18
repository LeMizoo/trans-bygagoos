import React, { useState, useEffect } from 'react';
import { Check, X, Clock, DollarSign, User, Calendar } from 'lucide-react';
import { api } from '../api/client';

export function VersementsPage() {
  const [versements, setVersements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersements = () => {
    api.get('/versements').then(r => {
      setVersements(Array.isArray(r.data) ? r.data : (r.data?.items || []));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVersements(); }, []);

  const valider = (id: string) => {
    api.put(`/versements/${id}`, { statut: 'VALIDE' }).then(fetchVersements);
  };

  const refuser = (id: string) => {
    api.put(`/versements/${id}`, { statut: 'REFUSE' }).then(fetchVersements);
  };

  const liste = Array.isArray(versements) ? versements : [];
  const total = liste.reduce((s, v) => s + (v.montant || 0), 0);

  const statutBadge = (statut: string) => {
    if (!statut || statut === 'EN_ATTENTE') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1"><Clock size={12}/> En attente</span>;
    if (statut === 'VALIDE') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1"><Check size={12}/> Validé</span>;
    return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1"><X size={12} /> Refusé</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">💵 Versements</h2>
        <p className="text-gray-500 mt-1">{liste.length} versement(s) · Total: {total.toLocaleString()} Ar</p>
      </div>
      {liste.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">Aucun versement</p>
        </div>
      ) : (
        <div className="space-y-3">
          {liste.map((v: any) => (
            <div key={v.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-green-600">+{(v.montant || 0).toLocaleString()} Ar</div>
                  <div className="text-sm text-gray-500">{v.mode || 'N/A'} · {v.reference || 'N/A'}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <User size={12} /> {v.user?.nom || 'N/A'} · <Calendar size={12} /> {v.date ? new Date(v.date).toLocaleDateString('fr') : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statutBadge(v.statut)}
                {(!v.statut || v.statut === 'EN_ATTENTE') && (
                  <>
                    <button onClick={() => valider(v.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check size={16} /></button>
                    <button onClick={() => refuser(v.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><X size={16} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// force recompile

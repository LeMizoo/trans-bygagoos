import React, { useState, useEffect } from 'react';
import { Search, Users, Package, Mail, Phone, MapPin, CheckCircle, XCircle, Eye, Edit3 } from 'lucide-react';
import { api } from '../../api/client';

export const LivreursPage = () => {
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/utilisateurs').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      // Filtrer seulement les LIVREUR
      setLivreurs(data.filter((u: any) => u.role === 'LIVREUR'));
    }).finally(() => setLoading(false));
  }, []);

  const toggleStatut = (l: any) => {
    const newStatut = l.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    api.put(`/utilisateurs/${l.id}`, { statut: newStatut }).then(() => {
      setLivreurs(prev => prev.map(x => x.id === l.id ? { ...x, statut: newStatut } : x));
    });
  };

  const filtered = livreurs.filter(l => 
    l.nom?.toLowerCase().includes(search.toLowerCase()) ||
    l.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    l.codeAcces?.toLowerCase().includes(search.toLowerCase()) ||
    l.cooperative?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const actifs = filtered.filter(l => l.statut === 'ACTIF').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📦 Livreurs</h2>
          <p className="text-gray-500 mt-1">{filtered.length} livreur(s) · {actifs} actif(s)</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un livreur..." 
            className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-64" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">Aucun livreur trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(l => (
            <div key={l.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{l.nom} {l.prenom}</h3>
                    {l.codeAcces && (
                      <span className="text-xs font-mono text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                        {l.codeAcces}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => toggleStatut(l)}
                  className={`px-2 py-1 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 ${
                    l.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {l.statut === 'ACTIF' ? '✅ Actif' : '❌ Inactif'}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail size={14} /> {l.email || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-green-500" />
                  {l.cooperative?.nom || 'Non assigné'}
                </div>
              </div>

              {l.pin && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-xs text-gray-400">🔑 PIN: <span className="font-mono font-bold">{l.pin}</span></span>
                  <button className="text-xs text-indigo-500 hover:text-indigo-700">
                    <Eye size={14} className="inline mr-1" /> Détails
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

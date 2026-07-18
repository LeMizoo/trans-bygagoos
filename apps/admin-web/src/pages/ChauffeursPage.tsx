import { useQuery } from '@tanstack/react-query';
import { Users, Search, Bike, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client';

export function ChauffeursPage() {
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['utilisateurs'],
    queryFn: () => api.get('/utilisateurs').then(r => r.data),
    refetchInterval: 15000,
  });

  // Filtrer SEULEMENT les chauffeurs
  const chauffeurs = Array.isArray(users) 
    ? users.filter((u: any) => u.role === 'CHAUFFEUR')
    : [];

  const filtered = chauffeurs.filter((c: any) => 
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    c.codeAcces?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">👤 Chauffeurs</h2>
          <p className="text-gray-500 mt-1">{chauffeurs.length} chauffeur(s) trouvé(s)</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Rechercher un chauffeur..." 
            className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-64" 
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">Aucun chauffeur trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c: any) => (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Users size={24} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{c.nom || '?'} {c.prenom || ''}</h3>
                    {c.codeAcces && (
                      <span className="text-xs font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                        {c.codeAcces}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  c.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {c.statut === 'ACTIF' ? '✅ Actif' : '❌ Inactif'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-xs">📧</span> {c.email || 'N/A'}
                </div>
                {c.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} /> {c.telephone}
                  </div>
                )}
                {c.flotte?.nom && (
                  <div className="flex items-center gap-2">
                    <Bike size={14} className="text-orange-500" /> {c.flotte.nom}
                  </div>
                )}
                {c.flotteId && !c.flotte?.nom && (
                  <div className="flex items-center gap-2">
                    <Bike size={14} className="text-orange-500" /> Flotte assignée
                  </div>
                )}
              </div>

              {c.pin && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400">🔑 PIN: <span className="font-mono font-bold">{c.pin}</span></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

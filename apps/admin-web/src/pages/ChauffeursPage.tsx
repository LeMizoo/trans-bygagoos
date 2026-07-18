import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client';

export function ChauffeursPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const { data: chauffeurs, isLoading } = useQuery({
    queryKey: ['chauffeurs'],
    queryFn: () => api.get('/utilisateurs?role=CHAUFFEUR').then(r => r.data),
    refetchInterval: 15000,
  });

  const liste = Array.isArray(chauffeurs) ? chauffeurs : [];

  const filtered = liste.filter((c: any) => 
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.codeAcces?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">👤 Chauffeurs</h2>
          <p className="text-gray-500 mt-1">{liste.length} chauffeur(s)</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
      </div>

      {msg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c: any) => (
          <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Users size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="font-bold">{c.nom} {c.prenom}</div>
                <div className="text-xs text-gray-400">{c.codeAcces || 'N/A'}</div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-500">
              <div>📧 {c.email || 'N/A'}</div>
              <div>📱 {c.telephone || 'N/A'}</div>
              <div>🟢 {c.statut || 'ACTIF'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

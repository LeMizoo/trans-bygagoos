import { useQuery } from '@tanstack/react-query';
import { Receipt, Search } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client';

export function DepensesPage() {
  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('tous');

  const { data: depenses, isLoading } = useQuery({
    queryKey: ['depenses'],
    queryFn: () => api.get('/depenses').then(r => r.data),
    refetchInterval: 15000,
  });

  const liste = Array.isArray(depenses) ? depenses : [];
  
  const filtered = liste.filter((d: any) => {
    const matchSearch = d.description?.toLowerCase().includes(search.toLowerCase()) || d.type?.toLowerCase().includes(search.toLowerCase());
    const matchCategorie = categorieFilter === 'tous' || d.type === categorieFilter;
    return matchSearch && matchCategorie;
  });

  const total = filtered.reduce((sum: number, d: any) => sum + (d.montant || 0), 0);

  const categories = [...new Set(liste.map((d: any) => d.type).filter(Boolean))] as string[];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">💰 Dépenses</h2>
          <p className="text-gray-500 mt-1">{filtered.length} dépense(s) · Total: {total.toLocaleString()} Ar</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." 
              className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <select value={categorieFilter} onChange={e => setCategorieFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="tous">Toutes catégories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((d: any) => (
          <div key={d.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Receipt size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{d.description || d.type}</div>
              <div className="text-xs text-gray-400">
                {d.user?.nom} · {new Date(d.date).toLocaleDateString('fr')}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">-{(d.montant || 0).toLocaleString()} Ar</div>
              <div className="text-xs text-gray-400">{d.type}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucune dépense trouvée</p>
        )}
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client';

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
    refetchInterval: 10000,
  });

  const courses = Array.isArray(coursesData) ? coursesData : [];
  const filtered = courses.filter((c: any) => 
    c.depart?.toLowerCase().includes(search.toLowerCase()) ||
    c.arrivee?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">🛵 Courses</h2>
          <p className="text-gray-500 mt-1">{courses.length} course(s)</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
      </div>

      <div className="space-y-3">
        {paginated.map((c: any) => (
          <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-green-500" />
                <span>{c.depart || 'N/A'}</span>
                <span className="text-gray-400">→</span>
                <MapPin size={16} className="text-red-500" />
                <span>{c.arrivee || 'N/A'}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {c.user?.nom} · {new Date(c.dateCourse).toLocaleString('fr')}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">{(c.prix || 0).toLocaleString()} Ar</div>
              <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                c.statut === 'TERMINE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>{c.statut || 'EN_COURS'}</div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

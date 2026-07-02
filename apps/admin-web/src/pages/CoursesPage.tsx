import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

const typeLabels: Record<string, string> = {
  NORMALE: '🚖 Course normale',
  ADY_VAROTRA: '🛺 Ady Varotra',
  LOCATION_JOURNALIERE: '📅 Location',
};

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data: allCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => axios.get(`${API}/courses?flotteId=${JSON.parse(localStorage.getItem("user")||"{}")?.flotteId||""}`).then(r => r.data),
    refetchInterval: 10000,
  });

  const { data: stats } = useQuery({
    queryKey: ['courses-stats'],
    queryFn: () => axios.get(`${API}/courses/stats`).then(r => r.data),
  });

  const courses = Array.isArray(allCourses) ? allCourses : [];
  
  const filtered = courses.filter((c: any) => {
    const matchSearch = !search || 
      c.chauffeur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      c.moto?.immatriculation?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'tous' || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin size={24} className="text-primary" /> Courses
        </h1>
        <span className="text-sm text-gray-500">{courses.length} courses</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats?.coursesAujourdhui || 0}</div>
          <div className="text-xs text-gray-500">Aujourd'hui</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{(stats?.caAujourdhui || 0).toLocaleString()} Ar</div>
          <div className="text-xs text-gray-500">CA aujourd'hui</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{(stats?.commissionAujourdhui || 0).toLocaleString()} Ar</div>
          <div className="text-xs text-gray-500">Commission</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
        </div>
        {['tous', 'NORMALE', 'ADY_VAROTRA', 'LOCATION_JOURNALIERE'].map(t => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${typeFilter === t ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {t === 'tous' ? 'Tous' : typeLabels[t] || t}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
            <th className="p-3">Date</th><th className="p-3">Chauffeur</th><th className="p-3">Moto</th><th className="p-3">Type</th><th className="p-3 text-right">Distance</th><th className="p-3 text-right">Prix</th><th className="p-3 text-right">Commission</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {paginated.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 text-xs">{new Date(c.createdAt).toLocaleString('fr')}</td>
                <td className="p-3 font-medium">{c.chauffeur?.nom}</td>
                <td className="p-3">{c.moto?.immatriculation}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs">{typeLabels[c.type] || c.type}</span></td>
                <td className="p-3 text-right">{c.distance > 0 ? `${c.distance} km` : '-'}</td>
                <td className="p-3 text-right font-medium">{c.prix?.toLocaleString()} Ar</td>
                <td className="p-3 text-right text-orange-600">{c.commission?.toLocaleString()} Ar</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t dark:border-gray-700">
            <span className="text-xs text-gray-500">Page {page}/{totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page > 3 ? page - 3 + i : i + 1;
                if (p > totalPages) return null;
                return <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}>{p}</button>;
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

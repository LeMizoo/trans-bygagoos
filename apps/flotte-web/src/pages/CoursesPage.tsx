import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, Bike, DollarSign, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';

export function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(function() {
    api.get('/courses').then(function(res) {
      setCourses(Array.isArray(res.data) ? res.data : []);
    }).finally(function() { setLoading(false); });
  }, []);

  var filtered = courses.filter(function(c: any) {
    var matchSearch = (c.depart + c.arrivee + c.user?.nom).toLowerCase().includes(search.toLowerCase());
    var matchType = !typeFilter || c.statut === typeFilter;
    return matchSearch && matchType;
  });

  var totalPages = Math.ceil(filtered.length / limit);
  var paginated = filtered.slice((page - 1) * limit, page * limit);
  var totalCA = filtered.reduce(function(s: number, c: any) { return s + (c.prix || 0); }, 0);
  var totalCommission = Math.round(totalCA * 0.2);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="p-6 lg:p-8 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">🛵 Gestion des courses</h2>
          <p className="text-gray-500">{filtered.length} course(s) trouvée(s)</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Recherche</label>
            <div className="relative">
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Départ, arrivée..."
                className="pl-8 pr-3 py-2 border rounded-lg dark:bg-gray-700 text-sm w-48" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Statut</label>
            <select value={typeFilter} onChange={function(e) { setTypeFilter(e.target.value); }}
              className="p-2 border rounded-lg dark:bg-gray-700 text-sm">
              <option value="">Tous</option>
              <option value="TERMINE">✅ Terminée</option>
              <option value="EN_COURS">🔵 En cours</option>
              <option value="ANNULEE">❌ Annulée</option>
            </select>
          </div>
          <button onClick={function() { setSearch(''); setTypeFilter(''); }}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">
            <RotateCcw size={14} /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Courses trouvées', value: filtered.length, icon: MapPin },
          { label: 'CA total', value: totalCA.toLocaleString() + ' Ar', icon: DollarSign },
          { label: 'Commission (20%)', value: totalCommission.toLocaleString() + ' Ar', icon: Bike },
        ].map(function(s: any, i: number) {
          return (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border text-center">
              <s.icon size={20} className="mx-auto mb-1 text-orange-500" />
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Chauffeur</th>
                <th className="text-left py-3 px-4">Trajet</th>
                <th className="text-center py-3 px-4">Statut</th>
                <th className="text-right py-3 px-4">Prix</th>
                <th className="text-right py-3 px-4">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">Aucune course</td></tr>
              ) : (
                paginated.map(function(c: any) {
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-xs">{new Date(c.dateCourse).toLocaleDateString('fr') + ' ' + new Date(c.dateCourse).toLocaleTimeString('fr', {hour:'2-digit',minute:'2-digit'})}</td>
                      <td className="py-3 px-4"><User size={14} className="inline mr-1" />{c.user?.nom || 'N/A'}</td>
                      <td className="py-3 px-4"><MapPin size={14} className="inline mr-1 text-green-500" />{c.depart} → <MapPin size={14} className="inline mr-1 text-red-500" />{c.arrivee}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={'px-2 py-1 rounded-full text-xs font-bold ' + (c.statut === 'TERMINE' ? 'bg-green-100 text-green-700' : c.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')}>
                          {c.statut}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600">{(c.prix || 0).toLocaleString()} Ar</td>
                      <td className="py-3 px-4 text-right">{Math.round((c.prix || 0) * 0.2).toLocaleString()} Ar</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={function() { setPage(function(p: number) { return Math.max(1, p - 1); }); }} disabled={page === 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"><ChevronLeft size={20} /></button>
          <span className="text-sm">Page {page}/{totalPages}</span>
          <button onClick={function() { setPage(function(p: number) { return Math.min(totalPages, p + 1); }); }} disabled={page === totalPages}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
}

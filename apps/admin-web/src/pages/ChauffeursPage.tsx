import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, Search, Bike, Phone, Eye, Edit, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function ChauffeursPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs'],
    queryFn: () => axios.get(`${API}/chauffeurs`).then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: detail } = useQuery({
    queryKey: ['chauffeur', selected?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${selected.id}`).then(r => r.data),
    enabled: !!selected,
  });

  const liste = Array.isArray(chauffeurs) ? chauffeurs : [];
  
  const filtered = liste.filter((c: any) =>
    !search || c.nom?.toLowerCase().includes(search.toLowerCase()) || c.codeAcces?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const stats = {
    total: liste.length,
    enService: liste.filter((c: any) => c.statut === 'EN_SERVICE').length,
    sansMoto: liste.filter((c: any) => !c.motoId).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={24} className="text-primary" /> Chauffeurs
        </h1>
        <span className="text-sm text-gray-500">{stats.total} chauffeurs</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{stats.enService}</div>
          <div className="text-xs text-gray-500">En service</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.sansMoto}</div>
          <div className="text-xs text-gray-500">Sans moto</div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {paginated.map((c: any) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                selected?.id === c.id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 dark:text-white">{c.nom}</p>
                <span className={`w-2 h-2 rounded-full ${
                  c.statut === 'EN_SERVICE' ? 'bg-green-500' : c.statut === 'EN_PAUSE' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <p className="text-sm text-gray-500">{c.codeAcces}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Phone size={10} /> {c.telephone}</span>
                <span className="flex items-center gap-1"><Bike size={10} /> {c.moto?.immatriculation || 'Sans moto'}</span>
              </div>
            </button>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 pt-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={14} /></button>
              <span className="text-xs text-gray-500 py-1">Page {page}/{totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={14} /></button>
            </div>
          )}
        </div>

        {/* Détail */}
        <div className="lg:col-span-2">
          {detail ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{detail.nom}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  detail.statut === 'EN_SERVICE' ? 'bg-green-100 text-green-700' :
                  detail.statut === 'EN_PAUSE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>{detail.statut}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Code :</span> <strong>{detail.codeAcces}</strong></div>
                <div><span className="text-gray-500">Tél :</span> <strong>{detail.telephone}</strong></div>
                <div><span className="text-gray-500">Solde :</span> <strong className="text-primary">{detail.solde?.toLocaleString()} Ar</strong></div>
                <div><span className="text-gray-500">Moto :</span> <strong>{detail.moto?.immatriculation || 'Aucune'}</strong></div>
              </div>

              {detail.moto && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Bike size={18} className="text-gray-400" />
                  <span className="text-sm">{detail.moto.marque} {detail.moto.modele} - {detail.moto.kmActuel?.toLocaleString()} km</span>
                </div>
              )}

              {/* Dernières courses */}
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><Clock size={14} /> Dernières courses</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {detail.courses?.slice(0, 5).map((course: any) => (
                    <div key={course.id} className="flex justify-between text-xs p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                      <span className="text-gray-500">{new Date(course.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="capitalize">{course.type?.replace('_', ' ').toLowerCase()}</span>
                      <span className="font-medium">{course.prix?.toLocaleString()} Ar</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400">
              <Users size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Sélectionnez un chauffeur pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

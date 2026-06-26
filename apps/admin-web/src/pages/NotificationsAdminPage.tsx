import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, BellRing, Check, Archive, Trash2, Search, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const LIMIT = 10;

export function NotificationsAdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page, search],
    queryFn: () => axios.get(`${API}/notifications?page=${page}&limit=${LIMIT}&search=${search}`).then(r => r.data),
    refetchInterval: 15000,
  });

  const items = data?.items || data?.notifications || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / LIMIT);

  const marquerLu = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/notifications/${id}/lu`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); setMsg('✅ Marqué comme lu'); },
  });

  const supprimer = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/notifications/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); setSelected(new Set()); setMsg('🗑️ Supprimé'); },
  });

  const actionSelection = async (action: 'lire' | 'supprimer') => {
    if (selected.size === 0) { setMsg('⚠️ Aucune sélection'); return; }
    if (action === 'supprimer' && !confirm(`Supprimer ${selected.size} notification(s) ?`)) return;
    for (const id of selected) {
      try {
        if (action === 'lire') await axios.put(`${API}/notifications/${id}/lu`);
        else await axios.delete(`${API}/notifications/${id}`);
      } catch (e) {}
    }
    setMsg(`✅ ${action === 'lire' ? 'Lues' : 'Supprimées'} : ${selected.size}`);
    setSelected(new Set());
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((n: any) => n.id)));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={24} className="text-primary" /> Notifications
        </h1>
        <span className="text-sm text-gray-500">{total} notifications</span>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}

      {/* Barre d'actions + recherche */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => actionSelection('lire')} disabled={selected.size === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm disabled:opacity-50">
            <Check size={14} /> Tout lire ({selected.size || 0})
          </button>
          <button onClick={() => actionSelection('supprimer')} disabled={selected.size === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-lg text-sm disabled:opacity-50">
            <Trash2 size={14} /> Supprimer ({selected.size || 0})
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 dark:bg-gray-700 dark:border-gray-600" />
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-gray-400">Chargement...</div> : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="p-3 w-10">
                    <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="accent-primary" />
                  </th>
                  <th className="p-3">Titre</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {items.map((n: any) => (
                  <tr key={n.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!n.lu ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(n.id)} onChange={() => toggleSelect(n.id)} className="accent-primary" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <BellRing size={14} className={n.lu ? 'text-gray-400' : 'text-primary'} />
                        <span className={`font-medium ${!n.lu ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{n.titre}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500 max-w-xs truncate">{n.message}</td>
                    <td className="p-3 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('fr')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.lu ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {n.lu ? '✅ Lue' : '● Non lue'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        {!n.lu && (
                          <button onClick={() => marquerLu.mutate(n.id)} className="p-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-100" title="Marquer lu">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => { if (confirm('Supprimer ?')) supprimer.mutate(n.id); }} className="p-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg hover:bg-red-100" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between p-3 border-t dark:border-gray-700">
                <span className="text-xs text-gray-500">Page {page} / {pages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"><ChevronLeft size={16} /></button>
                  {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                    const p = page > 3 ? page - 3 + i : i + 1;
                    if (p > pages) return null;
                    return <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{p}</button>;
                  })}
                  <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

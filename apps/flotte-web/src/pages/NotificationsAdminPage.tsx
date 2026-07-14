/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, Check, Trash2 } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function NotificationsAdminPage() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => axios.get(`${API}/notifications`).then(r => r.data),
    refetchInterval: 15000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/notifications/${id}/lu`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotif = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifs = Array.isArray(data) ? data : [];

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Bell size={24} /> Notifications</h1>
      <div className="space-y-2">
        {notifs.map((n: any) => (
          <div key={n.id} className={`bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-start gap-3 ${n.lu ? 'opacity-60' : 'border-l-4 border-l-primary'}`}>
            <Bell size={18} className={n.lu ? 'text-gray-400' : 'text-primary mt-0.5'} />
            <div className="flex-1">
              <p className={`font-medium text-sm ${n.lu ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>{n.titre}</p>
              <p className="text-xs text-gray-400 mt-1">{n.message}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString('fr')}</p>
            </div>
            <div className="flex gap-1">
              {!n.lu && (
                <button onClick={() => markRead.mutate(n.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-500" title="Marquer lu">
                  <Check size={14} />
                </button>
              )}
              <button onClick={() => deleteNotif.mutate(n.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400" title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {notifs.length === 0 && <p className="text-gray-400 text-center py-12">Aucune notification</p>}
      </div>
    </div>
  );
}

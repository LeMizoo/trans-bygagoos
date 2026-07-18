import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2 } from 'lucide-react';
import { api } from '../api/client';

export function NotificationsAdminPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 15000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifs = Array.isArray(data) ? data : [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={24} /> Notifications
        </h1>
        {notifs.some((n: any) => !n.lu) && (
          <button onClick={() => markAllRead.mutate()}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">
            Tout marquer comme lu
          </button>
        )}
      </div>
      <div className="space-y-2">
        {notifs.map((n: any) => (
          <div key={n.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 border flex items-start gap-3 ${!n.lu ? 'border-l-4 border-l-indigo-500' : ''}`}>
            <Bell size={20} className={n.lu ? 'text-gray-300' : 'text-indigo-500'} />
            <div className="flex-1">
              <div className="font-medium">{n.titre}</div>
              <div className="text-sm text-gray-500">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('fr')}</div>
            </div>
            {!n.lu && (
              <button onClick={() => markRead.mutate(n.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg">
                <Check size={18} />
              </button>
            )}
          </div>
        ))}
        {notifs.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucune notification</p>
        )}
      </div>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, BellRing, Check } from 'lucide-react';

import { API_URL } from '../lib/api';
const API = API_URL;

export function NotificationsAdminPage() {
  const queryClient = useQueryClient();

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => axios.get(`${API}/notifications`).then(r => r.data),
    refetchInterval: 15000,
  });

  const marquerLu = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/notifications/${id}/lu`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const marquerToutLu = useMutation({
    mutationFn: async () => {
      const nonLu = notifs?.filter((n: any) => !n.lu) || [];
      await Promise.all(nonLu.map((n: any) => axios.put(`${API}/notifications/${n.id}/lu`)));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const nonLu = notifs?.filter((n: any) => !n.lu).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={24} /> Notifications
        </h1>
        {nonLu > 0 && (
          <button onClick={() => marquerToutLu.mutate()} className="text-sm text-primary hover:underline">
            Tout marquer comme lu ({nonLu})
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifs?.map((n: any) => (
          <div key={n.id} className={`bg-white rounded-xl border p-4 flex items-start gap-4 ${!n.lu ? 'border-primary/20 bg-primary/5' : 'border-gray-100'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              n.type === 'VERSEMENT' ? 'bg-yellow-100 text-yellow-600' :
              n.type === 'ASSISTANCE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <BellRing size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-semibold ${!n.lu ? 'text-gray-900' : 'text-gray-500'}`}>{n.titre}</p>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                </div>
                {!n.lu && (
                  <button onClick={() => marquerLu.mutate(n.id)} className="text-gray-400 hover:text-green-500 p-1" title="Marquer lu">
                    <Check size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString('fr')}</p>
            </div>
          </div>
        ))}
        {!notifs?.length && (
          <div className="text-center text-gray-400 py-12">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Aucune notification</p>
          </div>
        )}
      </div>
    </div>
  );
}

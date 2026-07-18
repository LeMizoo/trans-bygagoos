import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '../api/client';

export function AssistancePage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assistance'],
    queryFn: () => api.get('/assistance').then(r => r.data),
    refetchInterval: 15000,
  });

  const closeTicket = useMutation({
    mutationFn: (id: string) => api.put(`/assistance/${id}/status`, { statut: 'RESOLU' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assistance'] }),
  });

  const tickets = Array.isArray(data) ? data : (data?.items || []);

  const statutBadge = (statut: string) => {
    switch (statut) {
      case 'RESOLU': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1"><CheckCircle size={12}/> Résolu</span>;
      case 'EN_ATTENTE': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1"><Clock size={12} /> En attente</span>;
      default: return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1"><XCircle size={12} /> {statut}</span>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Wrench size={24} /> Assistance
      </h1>
      <div className="space-y-3">
        {tickets.map((t: any) => (
          <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold">{t.type || 'Ticket'}</div>
                <div className="text-sm text-gray-500 mt-1">{t.message}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {t.user?.nom} · {new Date(t.createdAt).toLocaleString('fr')}
                </div>
                {t.reponse && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    💬 Réponse: {t.reponse}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {statutBadge(t.statut)}
                {t.statut !== 'RESOLU' && (
                  <button onClick={() => closeTicket.mutate(t.id)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200">
                    Résoudre
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucun ticket d'assistance</p>
        )}
      </div>
    </div>
  );
}

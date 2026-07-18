import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Clock } from 'lucide-react';
import { api } from '../api/client';

export function VersementsPage() {
  const queryClient = useQueryClient();

  const { data: versements, isLoading } = useQuery({
    queryKey: ['versements'],
    queryFn: () => api.get('/versements').then(r => r.data),
    refetchInterval: 10000,
  });

  const validerMutation = useMutation({
    mutationFn: (id: string) => api.put(`/versements/${id}`, { statut: 'VALIDE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['versements'] }),
  });

  const refuserMutation = useMutation({
    mutationFn: (id: string) => api.put(`/versements/${id}`, { statut: 'REFUSE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['versements'] }),
  });

  const liste = Array.isArray(versements) ? versements : [];

  const statutBadge = (statut: string) => {
    switch (statut) {
      case 'VALIDE': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1"><Check size={12}/> Validé</span>;
      case 'REFUSE': return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1"><X size={12} /> Refusé</span>;
      default: return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1"><Clock size={12} /> En attente</span>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">💵 Versements</h2>
        <p className="text-gray-500 mt-1">{liste.length} versement(s)</p>
      </div>

      <div className="space-y-3">
        {liste.map((v: any) => (
          <div key={v.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border flex items-center justify-between">
            <div>
              <div className="font-bold text-green-600">+{(v.montant || 0).toLocaleString()} Ar</div>
              <div className="text-sm text-gray-500">{v.mode || 'N/A'} · {v.reference || 'N/A'}</div>
              <div className="text-xs text-gray-400">{v.user?.nom} · {new Date(v.date).toLocaleDateString('fr')}</div>
            </div>
            <div className="flex items-center gap-2">
              {statutBadge(v.statut)}
              {v.statut === 'EN_ATTENTE' && (
                <>
                  <button onClick={() => validerMutation.mutate(v.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                    <Check size={16} />
                  </button>
                  <button onClick={() => refuserMutation.mutate(v.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {liste.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucun versement trouvé</p>
        )}
      </div>
    </div>
  );
}

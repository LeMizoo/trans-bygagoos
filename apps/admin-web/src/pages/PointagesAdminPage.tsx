import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Clock, Play, Pause, RotateCcw, StopCircle, User } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

const typeStyle: Record<string, { icon: any; color: string; bg: string }> = {
  ARRIVEE: { icon: Play, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-500/10' },
  PAUSE: { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-500/10' },
  REPRISE: { icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10' },
  FIN_SERVICE: { icon: StopCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/10' },
};

export function PointagesAdminPage() {
  const queryClient = useQueryClient();

  const { data: pointages, isLoading } = useQuery({
    queryKey: ['pointages'],
    queryFn: () => axios.get(`${API}/pointages`).then(r => r.data),
    refetchInterval: 10000,
  });

  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs'],
    queryFn: () => axios.get(`${API}/chauffeurs`).then(r => r.data),
  });

  const pointer = useMutation({
    mutationFn: (data: { chauffeurId: string; type: string }) =>
      axios.post(`${API}/pointages`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointages'] });
      queryClient.invalidateQueries({ queryKey: ['chauffeurs'] });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pointages</h1>

      {/* Pointage rapide */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Pointage rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {chauffeurs?.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{c.nom}</p>
                <p className="text-xs text-gray-500">{c.codeAcces}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => pointer.mutate({ chauffeurId: c.id, type: 'ARRIVEE' })}
                  className="p-1.5 bg-green-100 dark:bg-green-500/20 text-green-600 rounded-lg hover:bg-green-200" title="Arrivée">
                  <Play size={14} />
                </button>
                <button onClick={() => pointer.mutate({ chauffeurId: c.id, type: 'PAUSE' })}
                  className="p-1.5 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 rounded-lg hover:bg-yellow-200" title="Pause">
                  <Pause size={14} />
                </button>
                <button onClick={() => pointer.mutate({ chauffeurId: c.id, type: 'REPRISE' })}
                  className="p-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-lg hover:bg-blue-200" title="Reprise">
                  <RotateCcw size={14} />
                </button>
                <button onClick={() => pointer.mutate({ chauffeurId: c.id, type: 'FIN_SERVICE' })}
                  className="p-1.5 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-lg hover:bg-red-200" title="Fin">
                  <StopCircle size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="p-3 font-medium">Heure</th>
                <th className="p-3 font-medium">Chauffeur</th>
                <th className="p-3 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading && <tr><td colSpan={3} className="p-8 text-center text-gray-400">Chargement...</td></tr>}
              {pointages?.slice(0, 50).map((p: any) => {
                const style = typeStyle[p.type] || typeStyle.ARRIVEE;
                const Icon = style.icon;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm">
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {new Date(p.datePointage).toLocaleString('fr', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-medium text-gray-900 dark:text-white">{p.chauffeur?.nom}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${style.bg} ${style.color}`}>
                        <Icon size={12} /> {p.type.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

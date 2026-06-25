import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, AlertCircle, Wrench, Check } from 'lucide-react';
const API = "https://trans-bygagoos.onrender.com/api/v1";

const urgenceColor: Record<string, string> = {
  FAIBLE: 'bg-blue-100 text-blue-700',
  NORMALE: 'bg-yellow-100 text-yellow-700',
  URGENTE: 'bg-orange-100 text-orange-700',
  CRITIQUE: 'bg-red-100 text-red-700',
};

const typeIcon: Record<string, any> = {
  PANNE: Wrench,
  ACCIDENT: AlertTriangle,
  COURSE_SUPPLEMENTAIRE: AlertCircle,
  AUTRE: AlertCircle,
};

export function AssistancePage() {
  const queryClient = useQueryClient();

  const { data: assistances } = useQuery({
    queryKey: ['assistance'],
    queryFn: () => axios.get(`${API}/assistance`).then((r) => r.data),
    refetchInterval: 10000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      axios.put(`${API}/assistance/${id}/statut`, { statut }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assistance'] }),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assistance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assistances?.map((a: any) => {
          const Icon = typeIcon[a.type] || AlertCircle;
          return (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={18} className="text-gray-500" />
                  <span className="font-semibold">{a.type.replace('_', ' ')}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${urgenceColor[a.urgence]}`}>
                  {a.urgence}
                </span>
              </div>

              <p className="text-sm text-gray-600">{a.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{a.chauffeur?.nom}</span>
                <span>{new Date(a.createdAt).toLocaleString('fr-FR')}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  a.statut === 'OUVERT' ? 'bg-red-50 text-red-600' :
                  a.statut === 'EN_COURS' ? 'bg-blue-50 text-blue-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {a.statut === 'OUVERT' ? '🔴 Ouvert' : a.statut === 'EN_COURS' ? '🔵 En cours' : '🟢 Résolu'}
                </span>

                {a.statut !== 'RESOLU' && (
                  <div className="flex gap-1">
                    {a.statut === 'OUVERT' && (
                      <button
                        onClick={() => updateMutation.mutate({ id: a.id, statut: 'EN_COURS' })}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                      >
                        Prendre
                      </button>
                    )}
                    <button
                      onClick={() => updateMutation.mutate({ id: a.id, statut: 'RESOLU' })}
                      className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100 flex items-center gap-1"
                    >
                      <Check size={12} /> Résoudre
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

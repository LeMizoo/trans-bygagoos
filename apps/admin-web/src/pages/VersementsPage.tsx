import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Check, X, Clock } from 'lucide-react';

import { API_URL } from '../lib/api';
const API = API_URL;

export function VersementsPage() {
  const queryClient = useQueryClient();

  const { data: versements } = useQuery({
    queryKey: ['versements'],
    queryFn: () => axios.get(`${API}/versements`).then((r) => r.data),
    refetchInterval: 10000,
  });

  const validerMutation = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/versements/${id}/valider`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['versements'] }),
  });

  const refuserMutation = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/versements/${id}/refuser`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['versements'] }),
  });

  const statutBadge = (statut: string) => {
    switch (statut) {
      case 'VALIDE': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1"><Check size={12} /> Validé</span>;
      case 'REFUSE': return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1"><X size={12} /> Refusé</span>;
      default: return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1"><Clock size={12} /> En attente</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Versements</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Chauffeur</th>
                <th className="p-3 font-medium text-right">Solde dû</th>
                <th className="p-3 font-medium text-right">Montant versé</th>
                <th className="p-3 font-medium">Statut</th>
                <th className="p-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {versements?.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-3">{new Date(v.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3 font-medium">{v.chauffeur?.nom}</td>
                  <td className="p-3 text-right">{v.montantDu.toLocaleString()} Ar</td>
                  <td className="p-3 text-right font-medium text-primary">{v.montantVerse.toLocaleString()} Ar</td>
                  <td className="p-3">{statutBadge(v.statut)}</td>
                  <td className="p-3">
                    {v.statut === 'EN_ATTENTE' && (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => validerMutation.mutate(v.id)} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Valider">
                          <Check size={16} />
                        </button>
                        <button onClick={() => refuserMutation.mutate(v.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Refuser">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

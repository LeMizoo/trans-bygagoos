import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Wrench, CheckCircle, Clock } from 'lucide-react';

const API = 'https://bygagoos-backend.onrender.com/api/v1';

export function AssistancePage() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['assistance'],
    queryFn: () => axios.get(`${API}/assistance`).then(r => r.data),
    refetchInterval: 15000,
  });

  const closeTicket = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/assistance/${id}`, { statut: 'FERME' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assistance'] }),
  });

  const tickets = Array.isArray(data) ? data : (data?.items || []);

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Wrench size={24} /> Assistance</h1>
      <div className="space-y-3">
        {tickets.map((t: any) => (
          <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className={`mt-1 text-lg ${t.urgence === 'haute' ? '🔴' : t.urgence === 'moyenne' ? '🟠' : '🟢'}`} />
                <div>
                  <p className="font-medium text-sm">{t.type} - {t.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleString('fr')} • {t.chauffeur?.nom || 'Chauffeur'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {t.statut === 'OUVERT' ? (
                  <>
                    <span className="text-xs text-yellow-600 flex items-center gap-1"><Clock size={12} /> Ouvert</span>
                    <button onClick={() => closeTicket.mutate(t.id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg">Fermer</button>
                  </>
                ) : (
                  <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Fermé</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {tickets.length === 0 && <p className="text-gray-400 text-center py-12">Aucun ticket d'assistance</p>}
      </div>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Building2, CheckCircle, XCircle, Clock, Phone, Mail, Calendar, Bike } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function FlottesAdminPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['flottes-admin'],
    queryFn: () => axios.get(`${API}/flottes`).then(r => r.data),
    refetchInterval: 15000,
  });

  const validerFlotte = useMutation({
    mutationFn: (id: string) => axios.post(`${API}/flottes/${id}/valider`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flottes-admin'] }),
  });

  const rejeterFlotte = useMutation({
    mutationFn: (id: string) => axios.post(`${API}/flottes/${id}/rejeter`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flottes-admin'] }),
  });

  const flottes = Array.isArray(data) ? data : [];
  const enAttente = flottes.filter((f: any) => f.statut === 'EN_ATTENTE');
  const actives = flottes.filter((f: any) => f.statut === 'ACTIF');

  const statutBadge = (statut: string) => {
    switch (statut) {
      case 'ACTIF': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Actif</span>;
      case 'EN_ATTENTE': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> En attente</span>;
      case 'REJETE': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle size={12} /> Rejeté</span>;
      default: return statut;
    }
  };

  const abonnementLabel = (abo: string) => {
    switch (abo) {
      case 'GRATUIT': return '🆓 Gratuit (1 moto)';
      case '2_5': return '🥈 2-5 motos';
      case '6_10': return '🥇 6-10 motos';
      case '11_PLUS': return '💎 11+ motos';
      default: return abo;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏢 Gestion des Flottes</h1>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1"><Clock size={14} className="text-yellow-500" /> {enAttente.length} en attente</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> {actives.length} actives</span>
        </div>
      </div>

      {/* Flottes en attente */}
      {enAttente.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
            <Clock size={20} /> En attente de validation ({enAttente.length})
          </h2>
          <div className="grid gap-4">
            {enAttente.map((f: any) => (
              <div key={f.id} className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-800 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                      {f.logo ? <img src={f.logo} alt="" className="w-10 h-10 object-contain" /> : <Building2 size={28} className="text-yellow-500" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{f.nom}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={12} /> {f.email || '-'}</span>
                        <span className="flex items-center gap-1"><Phone size={12} /> {f.telephone || '-'}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(f.createdAt).toLocaleDateString('fr')}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{f.description || 'Pas de description'}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {statutBadge(f.statut)}
                        <span className="text-xs text-gray-400">{abonnementLabel(f.abonnement)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => validerFlotte.mutate(f.id)}
                      disabled={validerFlotte.isPending}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Valider
                    </button>
                    <button
                      onClick={() => rejeterFlotte.mutate(f.id)}
                      disabled={rejeterFlotte.isPending}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                    >
                      <XCircle size={14} /> Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flottes actives */}
      <div>
        <h2 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
          <CheckCircle size={20} /> Flottes actives ({actives.length})
        </h2>
        <div className="grid gap-4">
          {actives.map((f: any) => (
            <div key={f.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  {f.logo ? <img src={f.logo} alt="" className="w-10 h-10 object-contain" /> : <Building2 size={28} className="text-primary" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{f.nom}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail size={12} /> {f.email || '-'}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {f.telephone || '-'}</span>
                    <span className="flex items-center gap-1"><Bike size={12} /> {f._count?.motos || 0} moto(s)</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {statutBadge(f.statut)}
                    <span className="text-xs text-gray-400">{abonnementLabel(f.abonnement)}</span>
                    {f.dateFinAbonnement && (
                      <span className="text-xs text-gray-400">
                        Fin: {new Date(f.dateFinAbonnement).toLocaleDateString('fr')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {actives.length === 0 && !isLoading && (
            <p className="text-gray-500 text-center py-8">Aucune flotte active.</p>
          )}
        </div>
      </div>
    </div>
  );
}

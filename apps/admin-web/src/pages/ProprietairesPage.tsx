import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Building2, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function ProprietairesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const flotteId = id || user?.flotteId;

  const { data: flotte } = useQuery({
    queryKey: ['flotte', flotteId],
    queryFn: () => axios.get(`${API}/flottes/${flotteId}`).then(r => r.data),
    enabled: !!flotteId,
  });

  if (!flotteId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🏢 Profil Flotte</h1>
        <p className="text-gray-500">Aucune flotte spécifiée.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      {id && (
        <button onClick={() => navigate('/app/flottes')} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4">
          <ArrowLeft size={18} /> Retour aux flottes
        </button>
      )}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Building2 size={24} /> {flotte?.nom || 'Profil Flotte'}
      </h1>

      {flotte ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
              {flotte.logo ? <img src={flotte.logo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 size={32} className="text-gray-400" />}
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut: <span className={`font-medium ${flotte.statut === 'ACTIF' ? 'text-green-600' : 'text-yellow-600'}`}>{flotte.statut}</span></p>
              <p className="text-sm text-gray-500">Abonnement: <span className="font-medium">{flotte.abonnement}</span></p>
              {flotte.dateFinAbonnement && <p className="text-sm text-gray-500">Fin abonnement: {new Date(flotte.dateFinAbonnement).toLocaleDateString('fr')}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600"><Mail size={16} /> {flotte.email || '-'}</div>
            <div className="flex items-center gap-2 text-gray-600"><Phone size={16} /> {flotte.telephone || '-'}</div>
            <div className="flex items-center gap-2 text-gray-600 col-span-2"><MapPin size={16} /> {flotte.adresse || '-'}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
            <div><p className="text-2xl font-bold">{flotte._count?.motos || 0}</p><p className="text-xs text-gray-500">Motos</p></div>
            <div><p className="text-2xl font-bold">{flotte._count?.chauffeurs || 0}</p><p className="text-xs text-gray-500">Chauffeurs</p></div>
            <div><p className="text-2xl font-bold">{flotte._count?.users || 0}</p><p className="text-xs text-gray-500">Utilisateurs</p></div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Chargement...</p>
      )}
    </div>
  );
}

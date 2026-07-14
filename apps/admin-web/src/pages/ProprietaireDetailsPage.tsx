import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Building2, Mail, Phone, Calendar, Users, Car } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function ProprietaireDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: flotte, isLoading } = useQuery({
    queryKey: ['flotte', id],
    queryFn: () => axios.get(`${API}/flottes/${id}`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!flotte) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Flotte non trouvée</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/app/flottes')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Retour aux flottes
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            {flotte.logo ? (
              <img src={flotte.logo} alt="" className="w-12 h-12 object-contain" />
            ) : (
              <Building2 size={32} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{flotte.nom}</h1>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Mail size={16} />
                <span>{flotte.email || 'Email non renseigné'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Phone size={16} />
                <span>{flotte.telephone || 'Téléphone non renseigné'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Car size={16} />
                <span>Type: {flotte.typeFlotte === 'TAXI_MOTO' ? '🏍️ Taxi Moto' : flotte.typeFlotte === 'TAXI_BE' ? '🛺 Taxi-Be' : '🚗 Taxi'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Users size={16} />
                <span>{flotte._count?.motos || 0} véhicule(s) - {flotte._count?.chauffeurs || 0} chauffeur(s)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar size={16} />
                <span>Statut: {flotte.statut === 'ACTIF' ? '✅ Actif' : flotte.statut === 'EN_ATTENTE' ? '⏳ En attente' : '❌ Inactif'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

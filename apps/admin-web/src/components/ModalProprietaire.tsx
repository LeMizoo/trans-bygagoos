import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { X, Building2, Mail, Phone, Calendar, Users, Car, Shield, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

interface ModalProprietaireProps {
  flotte: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalProprietaire({ flotte, isOpen, onClose }: ModalProprietaireProps) {
  const qc = useQueryClient();
  const [statut, setStatut] = useState(flotte?.statut || 'EN_ATTENTE');

  // Mutation pour changer le statut
  const changeStatut = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      axios.put(`${API}/flottes/${id}`, { statut }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flottes-admin'] });
      qc.invalidateQueries({ queryKey: ['flotte', flotte?.id] });
    },
  });

  if (!isOpen || !flotte) return null;

  const handleStatutChange = (nouveauStatut: string) => {
    setStatut(nouveauStatut);
    changeStatut.mutate({ id: flotte.id, statut: nouveauStatut });
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      ACTIF: { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} />, label: 'Actif' },
      EN_ATTENTE: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={16} />, label: 'En attente' },
      INACTIF: { color: 'bg-red-100 text-red-700', icon: <XCircle size={16} />, label: 'Inactif' },
    };
    const badge = badges[statut] || badges.EN_ATTENTE;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      TAXI_MOTO: '🏍️ Taxi Moto',
      TAXI_BE: '🛺 Taxi-Be',
      TAXI: '🚗 Taxi',
    };
    return types[type] || type;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <X size={20} />
        </button>

        {/* En-tête */}
        <div className="flex items-start gap-6 mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            {flotte.logo ? (
              <img src={flotte.logo} alt="" className="w-12 h-12 object-contain" />
            ) : (
              <Building2 size={32} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{flotte.nom}</h2>
            <div className="flex items-center gap-3 mt-2">
              {getStatutBadge(flotte.statut)}
              <span className="text-sm text-gray-500">{getTypeLabel(flotte.typeFlotte)}</span>
            </div>
          </div>
        </div>

        {/* Grille d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Mail size={18} className="text-gray-400" />
              <span>{flotte.email || 'Email non renseigné'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Phone size={18} className="text-gray-400" />
              <span>{flotte.telephone || 'Téléphone non renseigné'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Calendar size={18} className="text-gray-400" />
              <span>Créé le {new Date(flotte.createdAt).toLocaleDateString('fr')}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Users size={18} className="text-gray-400" />
              <span>{flotte._count?.chauffeurs || 0} chauffeur(s)</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Car size={18} className="text-gray-400" />
              <span>{flotte._count?.motos || 0} véhicule(s)</span>
            </div>
            {flotte.dateFinAbonnement && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Shield size={18} className="text-gray-400" />
                <span>Abonnement jusqu'au {new Date(flotte.dateFinAbonnement).toLocaleDateString('fr')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Changement de statut */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🔄 Changer le statut
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatutChange('ACTIF')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                statut === 'ACTIF'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <CheckCircle size={16} /> Activer
            </button>
            <button
              onClick={() => handleStatutChange('EN_ATTENTE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                statut === 'EN_ATTENTE'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              <Clock size={16} /> Mettre en attente
            </button>
            <button
              onClick={() => handleStatutChange('INACTIF')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                statut === 'INACTIF'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <XCircle size={16} /> Désactiver
            </button>
          </div>
          {changeStatut.isPending && (
            <div className="mt-2 text-sm text-gray-500">Mise à jour en cours...</div>
          )}
          {changeStatut.isSuccess && (
            <div className="mt-2 text-sm text-green-600">✅ Statut mis à jour avec succès</div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

interface Flotte {
  id: string;
  nom: string;
  typeFlotte: string;
  planAbonnement: string;
  statut: string;
  demandeUpgrade: string | null;
  nbVehicules: number;
  nbChauffeurs: number;
  proprietaire: {
    nom: string;
    email: string;
  };
}

export const FlottesAdminPage = () => {
  const [flottes, setFlottes] = useState<Flotte[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TOUS');
  const [search, setSearch] = useState('');
  const [selectedFlotte, setSelectedFlotte] = useState<Flotte | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFlottes();
  }, []);

  const fetchFlottes = async () => {
    try {
      const response = await api.get('/flottes');
      setFlottes(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (id: string, action: 'valider' | 'refuser') => {
    try {
      await api.post(`/flottes/${id}/valider-upgrade`, { action });
      fetchFlottes();
      setShowModal(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la validation');
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      TAXI_MOTO: '🏍️ Taxi Moto',
      TAXI_VILLE: '🚗 Taxi Ville',
      BUS: '🚌 Bus'
    };
    return types[type] || type;
  };

  const getStatusBadge = (statut: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: '✅ Active' },
      EN_ATTENTE: { color: 'bg-yellow-100 text-yellow-800', label: '⏳ En attente' },
      SUSPENDUE: { color: 'bg-red-100 text-red-800', label: '❌ Suspendue' }
    };
    return badges[statut] || { color: 'bg-gray-100 text-gray-800', label: statut };
  };

  const getPlanLabel = (plan: string) => {
    const plans: Record<string, string> = {
      GRATUIT: '🆓 Gratuit',
      '2_5': '📈 2-5 véhicules',
      '6_10': '🔥 6-10 véhicules',
      '11_PLUS': '💎 11+ véhicules',
      STANDARD: '📊 Standard',
      PREMIUM: '⭐ Premium'
    };
    return plans[plan] || plan;
  };

  const filteredFlottes = flottes.filter(f => {
    const matchType = filter === 'TOUS' || f.typeFlotte === filter;
    const matchSearch = f.nom.toLowerCase().includes(search.toLowerCase()) ||
                        f.proprietaire?.nom?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏢 Flottes</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez toutes les flottes de la plateforme</p>
        </div>
        <button onClick={fetchFlottes} className="btn-secondary flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une flotte..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['TOUS', 'TAXI_MOTO', 'TAXI_VILLE', 'BUS'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'TOUS' ? '📋 Tous' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des flottes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flotte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicules</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upgrade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFlottes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucune flotte trouvée
                  </td>
                </tr>
              ) : (
                filteredFlottes.map((f) => {
                  const status = getStatusBadge(f.statut);
                  return (
                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{f.nom}</p>
                          <p className="text-xs text-gray-500">{f.proprietaire?.nom}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getTypeLabel(f.typeFlotte)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getPlanLabel(f.planAbonnement)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {f.nbVehicules || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {f.demandeUpgrade ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
                            ⚡ Demande en attente
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {f.demandeUpgrade && (
                            <>
                              <button
                                onClick={() => handleValidation(f.id, 'valider')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Valider l'upgrade"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleValidation(f.id, 'refuser')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Refuser l'upgrade"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedFlotte(f); setShowModal(true); }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails */}
      {showModal && selectedFlotte && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Détails de la flotte</h2>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Nom</span>
                <span>{selectedFlotte.nom}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Type</span>
                <span>{getTypeLabel(selectedFlotte.typeFlotte)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Plan</span>
                <span>{getPlanLabel(selectedFlotte.planAbonnement)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Véhicules</span>
                <span>{selectedFlotte.nbVehicules || 0}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Chauffeurs</span>
                <span>{selectedFlotte.nbChauffeurs || 0}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Statut</span>
                <span>{getStatusBadge(selectedFlotte.statut).label}</span>
              </div>
              {selectedFlotte.demandeUpgrade && (
                <div className="flex justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="font-medium text-yellow-800">⚡ Demande d'upgrade</span>
                  <span className="text-yellow-800">En attente</span>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlottesAdminPage;

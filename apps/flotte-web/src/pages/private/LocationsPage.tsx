import React, { useState, useEffect } from 'react';
import { 
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Bike,
  User,
  DollarSign,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Location {
  id: string;
  vehiculeId: string;
  livreurId: string;
  dateDebut: string;
  dateFin: string | null;
  kmDebut: number;
  kmFin: number | null;
  kmParcourus: number | null;
  loyerPaye: number;
  statut: string;
  vehicule?: {
    id: string;
    numero: string;
    type: string;
    modele: string;
  };
  livreur?: {
    id: string;
    nom: string;
    telephone: string;
  };
}

export const LocationsPage = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [vehicules, setVehicules] = useState<any[]>([]);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    vehiculeId: '',
    livreurId: '',
    kmDebut: 0,
    loyerPaye: 15000,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showRetourModal, setShowRetourModal] = useState(false);
  const [retourData, setRetourData] = useState({ kmFin: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [locationsRes, vehiculesRes, livreursRes] = await Promise.all([
        api.get('/locations'),
        api.get('/vehicules'),
        api.get('/livreurs'),
      ]);
      setLocations(locationsRes.data);
      setVehicules(vehiculesRes.data);
      setLivreurs(livreursRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/locations', {
        coopId: user?.coopId || 'cmriwp6kv000112lu4u746aw9',
        vehiculeId: formData.vehiculeId,
        livreurId: formData.livreurId,
        kmDebut: formData.kmDebut,
        loyerPaye: formData.loyerPaye,
      });

      setSuccess('✅ Location créée avec succès !');
      setShowModal(false);
      setFormData({ vehiculeId: '', livreurId: '', kmDebut: 0, loyerPaye: 15000 });
      fetchData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleRetour = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedLocation) return;

    try {
      await api.put(`/locations/${selectedLocation.id}/retour`, {
        kmFin: retourData.kmFin,
        etat: 'Bon état',
      });

      setSuccess('✅ Retour du véhicule effectué !');
      setShowRetourModal(false);
      setSelectedLocation(null);
      setRetourData({ kmFin: 0 });
      fetchData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du retour');
    }
  };

  const openRetourModal = (location: Location) => {
    setSelectedLocation(location);
    setRetourData({ kmFin: location.kmDebut || 0 });
    setShowRetourModal(true);
  };

  const getStatusBadge = (statut: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      EN_COURS: { color: 'bg-yellow-100 text-yellow-800', label: '🔄 En cours', icon: Clock },
      TERMINE: { color: 'bg-green-100 text-green-800', label: '✅ Terminé', icon: CheckCircle },
      ANNULEE: { color: 'bg-red-100 text-red-800', label: '❌ Annulée', icon: XCircle },
    };
    return badges[statut] || { color: 'bg-gray-100 text-gray-800', label: statut, icon: AlertCircle };
  };

  const filteredLocations = locations.filter(l => {
    const search = searchTerm.toLowerCase();
    return (
      l.vehicule?.numero?.toLowerCase().includes(search) ||
      l.livreur?.nom?.toLowerCase().includes(search) ||
      l.statut?.toLowerCase().includes(search)
    );
  });

  const getVehiculeDisponibles = () => {
    return vehicules.filter(v => v.statut === 'DISPONIBLE');
  };

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
          <h1 className="text-2xl font-bold text-gray-900">📋 Locations</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les locations de vos véhicules</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setError('');
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle location
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chauffeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Km</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    Aucune location trouvée
                  </td>
                </tr>
              ) : (
                filteredLocations.map((l) => {
                  const badge = getStatusBadge(l.statut);
                  const Icon = badge.icon;
                  return (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Bike className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">
                            {l.vehicule?.numero || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900">{l.livreur?.nom || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(l.dateDebut).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {l.kmDebut} km {l.kmFin && `→ ${l.kmFin} km`}
                        {l.kmParcourus && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({l.kmParcourus} km)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {l.loyerPaye} Ar
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center ${badge.color}`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {l.statut === 'EN_COURS' && (
                            <button
                              onClick={() => openRetourModal(l)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Retour du véhicule"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
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

      {/* Modal Nouvelle Location */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔑 Nouvelle location</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
                <select
                  value={formData.vehiculeId}
                  onChange={(e) => setFormData({ ...formData, vehiculeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un véhicule</option>
                  {getVehiculeDisponibles().map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.numero} - {v.modele} ({v.immatriculation})
                    </option>
                  ))}
                </select>
                {getVehiculeDisponibles().length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">⚠️ Aucun véhicule disponible</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chauffeur *</label>
                <select
                  value={formData.livreurId}
                  onChange={(e) => setFormData({ ...formData, livreurId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un chauffeur</option>
                  {livreurs.filter((l: any) => l.actif !== false).map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.nom} - {l.telephone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage de départ *</label>
                <input
                  type="number"
                  value={formData.kmDebut}
                  onChange={(e) => setFormData({ ...formData, kmDebut: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loyer (Ar)</label>
                <input
                  type="number"
                  value={formData.loyerPaye}
                  onChange={(e) => setFormData({ ...formData, loyerPaye: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Créer la location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Retour de véhicule */}
      {showRetourModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📥 Retour du véhicule</h2>
            <p className="text-sm text-gray-600 mb-4">
              Véhicule: <strong>{selectedLocation.vehicule?.numero}</strong>
              <br />
              Chauffeur: <strong>{selectedLocation.livreur?.nom}</strong>
              <br />
              Km départ: <strong>{selectedLocation.kmDebut} km</strong>
            </p>

            <form onSubmit={handleRetour} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage de retour *</label>
                <input
                  type="number"
                  value={retourData.kmFin}
                  onChange={(e) => setRetourData({ kmFin: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min={selectedLocation.kmDebut}
                  required
                />
                {retourData.kmFin < selectedLocation.kmDebut && (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ Le kilométrage de retour ne peut pas être inférieur au départ
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRetourModal(false);
                    setSelectedLocation(null);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={retourData.kmFin < selectedLocation.kmDebut}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Confirmer le retour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Car,
  Bike,
  Bus,
  CheckCircle,
  AlertCircle,
  Wrench
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Vehicule {
  id: string;
  numero: string;
  type: string;
  modele: string;
  immatriculation: string;
  statut: string;
  loyer: number;
  kilometrage: number;
  capacite: number;
}

export function VehiculesPage() {
  const { user } = useAuth();
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicule, setEditingVehicule] = useState<Vehicule | null>(null);
  const [formData, setFormData] = useState({
    numero: '',
    type: 'MOTO',
    modele: '',
    immatriculation: '',
    loyer: 15000,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicules();
  }, []);

  const fetchVehicules = async () => {
    try {
      const response = await api.get('/vehicules');
      setVehicules(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingVehicule) {
        await api.put(`/vehicules/${editingVehicule.id}`, formData);
      } else {
        await api.post('/vehicules', {
          ...formData,
          coopId: user?.coopId || 'cmriwp6kv000112lu4u746aw9',
        });
      }
      setShowModal(false);
      setEditingVehicule(null);
      setFormData({ numero: '', type: 'MOTO', modele: '', immatriculation: '', loyer: 15000 });
      fetchVehicules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (vehicule: Vehicule) => {
    setEditingVehicule(vehicule);
    setFormData({
      numero: vehicule.numero || '',
      type: vehicule.type || 'MOTO',
      modele: vehicule.modele || '',
      immatriculation: vehicule.immatriculation || '',
      loyer: vehicule.loyer || 15000,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        await api.delete(`/vehicules/${id}`);
        fetchVehicules();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const changeStatut = async (id: string, statut: string) => {
    try {
      await api.put(`/vehicules/${id}/statut`, { statut });
      fetchVehicules();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'MOTO': return <Bike className="h-5 w-5" />;
      case 'VOITURE': return <Car className="h-5 w-5" />;
      case 'BUS': return <Bus className="h-5 w-5" />;
      default: return <Truck className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (statut: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      DISPONIBLE: { color: 'bg-green-100 text-green-800', label: '✅ Disponible' },
      LOUE: { color: 'bg-yellow-100 text-yellow-800', label: '🔄 Loué' },
      REPARATION: { color: 'bg-red-100 text-red-800', label: '🔧 Réparation' },
      MAINTENANCE: { color: 'bg-orange-100 text-orange-800', label: '⚙️ Maintenance' },
    };
    return badges[statut] || { color: 'bg-gray-100 text-gray-800', label: statut };
  };

  const filteredVehicules = vehicules.filter(v => {
    const search = searchTerm.toLowerCase();
    return (
      v.numero?.toLowerCase().includes(search) ||
      v.modele?.toLowerCase().includes(search) ||
      v.immatriculation?.toLowerCase().includes(search)
    );
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
          <h1 className="text-2xl font-bold text-gray-900">🚚 Véhicules</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre parc automobile</p>
        </div>
        <button
          onClick={() => {
            setEditingVehicule(null);
            setFormData({ numero: '', type: 'MOTO', modele: '', immatriculation: '', loyer: 15000 });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un véhicule
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un véhicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicules.map((v) => {
          const badge = getStatusBadge(v.statut);
          return (
            <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    {getTypeIcon(v.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{v.numero || 'N/A'}</h3>
                    <p className="text-sm text-gray-500">{v.modele || v.type || 'N/A'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Immatriculation:</span> {v.immatriculation || 'N/A'}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Kilométrage:</span> {v.kilometrage || 0} km
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Loyer:</span> {v.loyer || 15000} Ar/jour
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Capacité:</span> {v.capacite || 'N/A'} kg
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => changeStatut(v.id, 'DISPONIBLE')}
                    className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Disponible"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => changeStatut(v.id, 'LOUE')}
                    className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Loué"
                  >
                    <Truck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => changeStatut(v.id, 'REPARATION')}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="En réparation"
                  >
                    <Wrench className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(v)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicules.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun véhicule trouvé</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingVehicule ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro *</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Moto 001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="MOTO">🏍️ Moto</option>
                  <option value="VOITURE">🚗 Voiture</option>
                  <option value="BUS">🚌 Bus</option>
                  <option value="CAMIONNETTE">🚚 Camionnette</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                <input
                  type="text"
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Yamaha TMax"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation</label>
                <input
                  type="text"
                  value={formData.immatriculation}
                  onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="001-TAA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loyer journalier (Ar)</label>
                <input
                  type="number"
                  value={formData.loyer}
                  onChange={(e) => setFormData({ ...formData, loyer: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVehicule(null);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  {editingVehicule ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehiculesPage;

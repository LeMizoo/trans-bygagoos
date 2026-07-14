import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Chauffeur {
  id: string;
  nom: string;
  telephone: string;
  type: string;
  actif: boolean;
  createdAt: string;
}

export const ChauffeursPage = () => {
  const { user } = useAuth();
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState<Chauffeur | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    type: 'LOCATAIRE',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const fetchChauffeurs = async () => {
    try {
      // Utiliser /livreurs au lieu de /chauffeurs
      const response = await api.get('/livreurs');
      setChauffeurs(response.data);
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
      if (editingChauffeur) {
        await api.put(`/livreurs/${editingChauffeur.id}`, formData);
      } else {
        await api.post('/livreurs', {
          ...formData,
          coopId: user?.coopId || 'cmriwp6kv000112lu4u746aw9',
        });
      }
      setShowModal(false);
      setEditingChauffeur(null);
      setFormData({ nom: '', telephone: '', type: 'LOCATAIRE' });
      fetchChauffeurs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (chauffeur: Chauffeur) => {
    setEditingChauffeur(chauffeur);
    setFormData({
      nom: chauffeur.nom,
      telephone: chauffeur.telephone,
      type: chauffeur.type,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      try {
        await api.delete(`/livreurs/${id}`);
        fetchChauffeurs();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const toggleActif = async (id: string, actif: boolean) => {
    try {
      await api.put(`/livreurs/${id}/actif`, { actif: !actif });
      fetchChauffeurs();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredChauffeurs = chauffeurs.filter(c =>
    c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telephone?.includes(searchTerm)
  );

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
          <h1 className="text-2xl font-bold text-gray-900">👨 Chauffeurs</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos chauffeurs</p>
        </div>
        <button
          onClick={() => {
            setEditingChauffeur(null);
            setFormData({ nom: '', telephone: '', type: 'LOCATAIRE' });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Ajouter un chauffeur
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un chauffeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des chauffeurs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredChauffeurs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucun chauffeur trouvé
                  </td>
                </tr>
              ) : (
                filteredChauffeurs.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium text-sm">
                            {c.nom?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="ml-3 font-medium text-gray-900">{c.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {c.telephone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        c.type === 'LOCATAIRE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {c.type === 'LOCATAIRE' ? '📌 Locataire' : '📋 Salarié'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActif(c.id, c.actif)}
                        className={`px-2 py-1 text-xs rounded-full flex items-center ${
                          c.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.actif ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Actif</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Inactif</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingChauffeur ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="LOCATAIRE">📍 Locataire</option>
                  <option value="SALARIE">📋 Salarié</option>
                </select>
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
                    setEditingChauffeur(null);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  {editingChauffeur ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

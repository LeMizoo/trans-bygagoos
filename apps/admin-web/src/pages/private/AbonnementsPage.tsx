import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

interface Abonnement {
  id: string;
  nom: string;
  type: string;
  prixMensuel: number;
  prixAnnuel: number;
  maxVehicules: number;
  features: string[];
}

export const AbonnementsPage = () => {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Abonnement | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    type: 'TAXI_MOTO',
    prixMensuel: 0,
    prixAnnuel: 0,
    maxVehicules: 0,
    features: '',
  });

  useEffect(() => {
    fetchAbonnements();
  }, []);

  const fetchAbonnements = async () => {
    try {
      const response = await api.get('/abonnements');
      setAbonnements(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()),
      };
      if (editing) {
        await api.put(`/abonnements/${editing.id}`, data);
      } else {
        await api.post('/abonnements', data);
      }
      setSuccess(editing ? '✅ Abonnement modifié' : '✅ Abonnement créé');
      setShowModal(false);
      setEditing(null);
      setFormData({ nom: '', type: 'TAXI_MOTO', prixMensuel: 0, prixAnnuel: 0, maxVehicules: 0, features: '' });
      fetchAbonnements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (abonnement: Abonnement) => {
    setEditing(abonnement);
    setFormData({
      nom: abonnement.nom,
      type: abonnement.type,
      prixMensuel: abonnement.prixMensuel,
      prixAnnuel: abonnement.prixAnnuel,
      maxVehicules: abonnement.maxVehicules,
      features: abonnement.features.join(', '),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      try {
        await api.delete(`/abonnements/${id}`);
        setSuccess('✅ Abonnement supprimé');
        fetchAbonnements();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors de la suppression');
      }
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
          <h1 className="text-2xl font-bold text-gray-900">💳 Abonnements</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les plans d'abonnement</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchAbonnements} className="btn-secondary flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </button>
          <button onClick={() => { setEditing(null); setFormData({ nom: '', type: 'TAXI_MOTO', prixMensuel: 0, prixAnnuel: 0, maxVehicules: 0, features: '' }); setShowModal(true); }} className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </button>
        </div>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {abonnements.map((abonnement) => (
          <div key={abonnement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{abonnement.nom}</h3>
              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                {getTypeLabel(abonnement.type)}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">💰 Prix mensuel:</span> {abonnement.prixMensuel.toLocaleString()} Ar
              </p>
              <p className="text-gray-600">
                <span className="font-medium">📅 Prix annuel:</span> {abonnement.prixAnnuel.toLocaleString()} Ar
              </p>
              <p className="text-gray-600">
                <span className="font-medium">🚗 Max véhicules:</span> {abonnement.maxVehicules}
              </p>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 font-medium mb-1">Fonctionnalités:</p>
                <ul className="space-y-0.5">
                  {abonnement.features.map((f, i) => (
                    <li key={i} className="text-xs text-gray-600">✓ {f}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-end space-x-2">
              <button onClick={() => handleEdit(abonnement)} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(abonnement.id)} className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {abonnements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun abonnement configuré</p>
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editing ? 'Modifier l\'abonnement' : 'Ajouter un abonnement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="TAXI_MOTO">🏍️ Taxi Moto</option>
                  <option value="TAXI_VILLE">🚗 Taxi Ville</option>
                  <option value="BUS">🚌 Bus</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix mensuel (Ar)</label>
                  <input type="number" value={formData.prixMensuel} onChange={(e) => setFormData({ ...formData, prixMensuel: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix annuel (Ar)</label>
                  <input type="number" value={formData.prixAnnuel} onChange={(e) => setFormData({ ...formData, prixAnnuel: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max véhicules</label>
                <input type="number" value={formData.maxVehicules} onChange={(e) => setFormData({ ...formData, maxVehicules: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonctionnalités (séparées par des virgules)</label>
                <input type="text" value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Suivi, Support, API..." />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Sauvegarde...' : editing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbonnementsPage;

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

interface Parametre {
  id: string;
  nom: string;
  valeur: string;
  categorie: string;
}

export const ParametresPage = () => {
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchParametres();
  }, []);

  const fetchParametres = async () => {
    try {
      const response = await api.get('/parametres');
      setParametres(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, valeur: string) => {
    setParametres(prev => prev.map(p => p.id === id ? { ...p, valeur } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/parametres', { parametres });
      setSuccess('✅ Paramètres sauvegardés avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getCategorieLabel = (categorie: string) => {
    const labels: Record<string, string> = {
      ABONNEMENT: '💳 Abonnements',
      VERSEMENT: '💰 Versements',
      COMMISSION: '📊 Commissions',
      GENERAL: '⚙️ Général'
    };
    return labels[categorie] || categorie;
  };

  const groupedParametres = parametres.reduce((acc, p) => {
    if (!acc[p.categorie]) acc[p.categorie] = [];
    acc[p.categorie].push(p);
    return acc;
  }, {} as Record<string, Parametre[]>);

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
          <h1 className="text-2xl font-bold text-gray-900">⚙️ Paramètres</h1>
          <p className="text-gray-500 text-sm mt-1">Configurez les paramètres de la plateforme</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchParametres} className="btn-secondary flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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

      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(groupedParametres).map(([categorie, items]) => (
          <div key={categorie} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {getCategorieLabel(categorie)}
            </h2>
            <div className="space-y-4">
              {items.map((param) => (
                <div key={param.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {param.nom.replace(/_/g, ' ').toUpperCase()}
                  </label>
                  <input
                    type="text"
                    value={param.valeur}
                    onChange={(e) => handleChange(param.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParametresPage;

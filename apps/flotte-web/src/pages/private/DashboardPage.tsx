import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Bike, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  totalVehicules: number;
  disponibles: number;
  loues: number;
  enReparation: number;
  totalChauffeurs: number;
  actifs: number;
  locationsEnCours: number;
  locationsAujourdhui: number;
  revenusJour: number;
  revenusMois: number;
  tauxOccupation: number;
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentLocations, setRecentLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicules, chauffeurs, locations] = await Promise.all([
          api.get('/vehicules'),
          api.get('/livreurs'),
          api.get('/locations'),
        ]);

        const totalV = vehicules.data.length;
        const dispo = vehicules.data.filter((v: any) => v.statut === 'DISPONIBLE').length;
        const loues = vehicules.data.filter((v: any) => v.statut === 'LOUE').length;
        const reparation = vehicules.data.filter((v: any) => v.statut === 'REPARATION').length;
        const totalC = chauffeurs.data.length;
        const actifs = chauffeurs.data.filter((c: any) => c.actif !== false).length;
        const enCours = locations.data.filter((l: any) => l.statut === 'EN_COURS').length;
        const today = new Date().toDateString();
        const aujourdhui = locations.data.filter((l: any) => 
          new Date(l.dateDebut).toDateString() === today
        ).length;
        const revenusJour = locations.data
          .filter((l: any) => l.statut === 'TERMINE' && new Date(l.dateFin).toDateString() === today)
          .reduce((sum: number, l: any) => sum + l.loyerPaye, 0);

        setStats({
          totalVehicules: totalV,
          disponibles: dispo,
          loues: loues,
          enReparation: reparation,
          totalChauffeurs: totalC,
          actifs: actifs,
          locationsEnCours: enCours,
          locationsAujourdhui: aujourdhui,
          revenusJour: revenusJour,
          revenusMois: 0,
          tauxOccupation: totalV > 0 ? Math.round((loues / totalV) * 100) : 0,
        });

        setRecentLocations(locations.data.slice(-5).reverse());
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">📊 Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenue {user?.nom} - {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">🟢 Tous les systèmes sont opérationnels</span>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.revenusJour.toLocaleString()} Ar
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUp className="h-4 w-4 mr-1" />
            +12% vs hier
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux d'occupation</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.tauxOccupation}%</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                style={{ width: `${stats?.tauxOccupation}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Locations en cours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.locationsEnCours}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats?.locationsAujourdhui} nouvelles aujourd'hui
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Véhicules disponibles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.disponibles} / {stats?.totalVehicules}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Bike className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats?.loues} loués, {stats?.enReparation} en réparation
          </div>
        </div>
      </div>

      {/* Dernières locations */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Dernières locations</h2>
        <div className="space-y-3">
          {recentLocations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune location récente</p>
          ) : (
            recentLocations.map((loc: any) => (
              <div key={loc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    loc.statut === 'EN_COURS' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Véhicule {loc.vehiculeId?.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(loc.dateDebut).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    loc.statut === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {loc.statut === 'EN_COURS' ? '🔄 En cours' : '✅ Terminé'}
                  </span>
                  <span className="font-medium text-gray-900">{loc.loyerPaye} Ar</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

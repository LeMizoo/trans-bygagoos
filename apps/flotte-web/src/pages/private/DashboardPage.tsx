import React, { useState, useEffect } from 'react';
import { Bike, Users, DollarSign, TrendingUp, Activity, Clock } from 'lucide-react';
import { api } from '../../api/client';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalVehicules: 0,
    vehiculesLoues: 0,
    totalChauffeurs: 0,
    chauffeursActifs: 0,
    revenusJour: 0,
    revenusMois: 0,
    locationsEnCours: 0,
    tauxOccupation: 0
  });

  useEffect(() => {
    // Données fictives pour le moment
    setStats({
      totalVehicules: 12,
      vehiculesLoues: 8,
      totalChauffeurs: 10,
      chauffeursActifs: 8,
      revenusJour: 120000,
      revenusMois: 2500000,
      locationsEnCours: 5,
      tauxOccupation: 67
    });
  }, []);

  const cards = [
    { title: 'Véhicules', value: `${stats.vehiculesLoues} / ${stats.totalVehicules}`, icon: Bike, color: 'bg-blue-500' },
    { title: 'Chauffeurs', value: `${stats.chauffeursActifs} / ${stats.totalChauffeurs}`, icon: Users, color: 'bg-green-500' },
    { title: 'Revenus aujourd\'hui', value: `${stats.revenusJour.toLocaleString()} Ar`, icon: DollarSign, color: 'bg-yellow-500' },
    { title: 'Locations en cours', value: stats.locationsEnCours, icon: Clock, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏠 Ma Flotte</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre flotte de véhicules</p>
        </div>
        <button className="btn-primary flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" /> Voir les statistiques
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Taux d'occupation</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-indigo-600 rounded-full h-4 transition-all duration-500" style={{ width: `${stats.tauxOccupation}%` }} />
              </div>
            </div>
            <span className="text-2xl font-bold text-indigo-600">{stats.tauxOccupation}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.vehiculesLoues} véhicules loués sur {stats.totalVehicules}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenus du mois</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.revenusMois.toLocaleString()} Ar</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12% vs mois dernier
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Actions rapides</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">➕ Ajouter un véhicule</button>
          <button className="btn-secondary">👨 Ajouter un chauffeur</button>
          <button className="btn-secondary">📋 Voir les locations</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

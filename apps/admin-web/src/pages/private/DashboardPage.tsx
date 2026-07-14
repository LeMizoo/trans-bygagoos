import React, { useState, useEffect } from 'react';
import { Building2, Users, Bike, Package, TrendingUp } from 'lucide-react';
import { api } from '../../api/client';

export const DashboardPage = () => {
  const [stats, setStats] = useState({ coops: 0, livreurs: 0, vehicules: 0, commandes: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coops, livreurs, vehicules, commandes] = await Promise.all([
          api.get('/coops'),
          api.get('/livreurs'),
          api.get('/vehicules'),
          api.get('/commandes'),
        ]);
        setStats({
          coops: coops.data.length,
          livreurs: livreurs.data.length,
          vehicules: vehicules.data.length,
          commandes: commandes.data.length,
        });
      } catch (err) {
        console.log('Stats non disponibles');
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: Building2, label: 'Coopératives', value: stats.coops, color: 'bg-indigo-500' },
    { icon: Users, label: 'Livreurs', value: stats.livreurs, color: 'bg-green-500' },
    { icon: Bike, label: 'Véhicules', value: stats.vehicules, color: 'bg-orange-500' },
    { icon: Package, label: 'Commandes', value: stats.commandes, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h2>
      <p className="text-gray-600 mb-8">Bienvenue sur Trans ByGagoos</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

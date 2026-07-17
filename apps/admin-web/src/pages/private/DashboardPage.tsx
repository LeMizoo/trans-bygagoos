import React, { useState, useEffect } from 'react';
import { Building2, Users, Bike, Package, TrendingUp, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { api } from '../../api/client';

export const DashboardPage = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/coops'),
      api.get('/livreurs'),
      api.get('/vehicules'),
      api.get('/commandes'),
    ]).then(([coops, livreurs, vehicules, commandes]) => {
      const coopsData = Array.isArray(coops.data) ? coops.data : [];
      const livreursData = Array.isArray(livreurs.data) ? livreurs.data : [];
      const vehiculesData = Array.isArray(vehicules.data) ? vehicules.data : [];
      const commandesData = Array.isArray(commandes.data) ? commandes.data : [];

      setStats({
        coops: coopsData.length,
        flottes: coopsData.filter((c: any) => c.nom?.toLowerCase().includes('flotte')).length,
        coopsCount: coopsData.filter((c: any) => c.nom?.toLowerCase().includes('coop') || c.nom?.toLowerCase().includes('express')).length,
        livreurs: livreursData.length,
        livreursFlotte: livreursData.filter((l: any) => l.coop?.nom?.toLowerCase().includes('flotte')).length,
        livreursCoop: livreursData.filter((l: any) => l.coop?.nom?.toLowerCase().includes('coop')).length,
        vehicules: vehiculesData.length,
        vehiculesDispo: vehiculesData.filter((v: any) => v.statut === 'DISPONIBLE').length,
        vehiculesEnCourse: vehiculesData.filter((v: any) => v.statut === 'EN_COURSE').length,
        commandes: commandesData.length,
        commandesEnCours: commandesData.filter((c: any) => c.statut === 'EN_COURS').length,
        commandesLivrees: commandesData.filter((c: any) => c.statut === 'LIVREE').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: '🏢 Coopératives', value: stats.coops, sub: `${stats.flottes} flottes · ${stats.coopsCount} coops`, icon: Building2, color: 'bg-indigo-500' },
    { title: '👤 Livreurs', value: stats.livreurs, sub: `${stats.livreursFlotte} flotte · ${stats.livreursCoop} coop`, icon: Users, color: 'bg-green-500' },
    { title: '🏍️ Véhicules', value: stats.vehicules, sub: `${stats.vehiculesDispo} dispo · ${stats.vehiculesEnCourse} en course`, icon: Bike, color: 'bg-orange-500' },
    { title: '📦 Commandes', value: stats.commandes, sub: `${stats.commandesEnCours} en cours · ${stats.commandesLivrees} livrées`, icon: Package, color: 'bg-purple-500' },
  ];

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">📊 Tableau de bord</h2>
        <p className="text-gray-500 mt-1">Vue d'ensemble de la plateforme Trans ByGagoos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <card.icon size={24} className="text-white" />
              </div>
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div className="text-3xl font-bold mb-1">{card.value}</div>
            <div className="text-sm text-gray-500">{card.title}</div>
            <div className="text-xs text-gray-400 mt-2">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Graphiques simples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4">📈 Activité récente</h3>
          <div className="space-y-4">
            {[
              { label: 'Véhicules disponibles', value: stats.vehiculesDispo || 0, max: stats.vehicules || 1, color: 'bg-green-500' },
              { label: 'Véhicules en course', value: stats.vehiculesEnCourse || 0, max: stats.vehicules || 1, color: 'bg-orange-500' },
              { label: 'Commandes livrées', value: stats.commandesLivrees || 0, max: stats.commandes || 1, color: 'bg-purple-500' },
            ].map((bar, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{bar.label}</span>
                  <span className="font-medium">{bar.value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${bar.color} h-2 rounded-full transition-all`} style={{ width: `${Math.round((bar.value / bar.max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4">🏢 Répartition</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">🏍️ Flottes</span>
              <span className="font-bold text-lg">{stats.flottes || 0}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${stats.coops ? (stats.flottes / stats.coops) * 100 : 0}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">📦 Coops</span>
              <span className="font-bold text-lg">{stats.coopsCount || 0}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${stats.coops ? (stats.coopsCount / stats.coops) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

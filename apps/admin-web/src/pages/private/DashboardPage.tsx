import React, { useState, useEffect } from 'react';
import { Building2, Users, Bike, Package, TrendingUp, TrendingDown, Activity } from 'lucide-react';
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
      const c = Array.isArray(coops.data) ? coops.data : [];
      const l = Array.isArray(livreurs.data) ? livreurs.data : [];
      const v = Array.isArray(vehicules.data) ? vehicules.data : [];
      const cmd = Array.isArray(commandes.data) ? commandes.data : [];
      setStats({
        coops: c.length,
        flottes: c.filter(x => x.nom?.toLowerCase().includes('flotte')).length,
        coopsCount: c.filter(x => !x.nom?.toLowerCase().includes('flotte')).length,
        livreurs: l.length,
        livreursActifs: l.filter(x => x.actif).length,
        vehicules: v.length,
        vehiculesDispo: v.filter(x => x.statut === 'DISPONIBLE').length,
        vehiculesEnCourse: v.filter(x => x.statut !== 'DISPONIBLE').length,
        commandes: cmd.length,
        caTotal: cmd.reduce((s: number, x: any) => s + (x.prix || 0), 0),
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Tableau de bord</h2>
        <p className="text-gray-500 mt-2">Vue d'ensemble de la plateforme Trans ByGagoos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Coopératives', value: stats.coops, sub: `${stats.flottes} flottes · ${stats.coopsCount} coops`, icon: Building2, color: 'from-indigo-500 to-blue-600' },
          { label: 'Livreurs actifs', value: stats.livreursActifs, sub: `sur ${stats.livreurs} total`, icon: Users, color: 'from-green-500 to-emerald-600' },
          { label: 'Véhicules dispo', value: stats.vehiculesDispo, sub: `${stats.vehiculesEnCourse} en course`, icon: Bike, color: 'from-orange-500 to-amber-600' },
          { label: 'Commandes', value: stats.commandes, sub: `${stats.caTotal?.toLocaleString()} Ar CA`, icon: Package, color: 'from-purple-500 to-pink-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-br ${card.color} w-11 h-11 rounded-xl flex items-center justify-center shadow-lg`}>
                <card.icon size={22} className="text-white" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-500">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1.5">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg mb-5 flex items-center gap-2">📈 Activité</h3>
          <div className="space-y-5">
            {[
              { label: 'Véhicules disponibles', value: stats.vehiculesDispo || 0, max: stats.vehicules || 1, color: 'bg-green-500' },
              { label: 'Véhicules en course', value: stats.vehiculesEnCourse || 0, max: stats.vehicules || 1, color: 'bg-orange-500' },
              { label: 'Livreurs actifs', value: stats.livreursActifs || 0, max: stats.livreurs || 1, color: 'bg-blue-500' },
            ].map((bar, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">{bar.label}</span>
                  <span className="font-bold">{bar.value}/{bar.max}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className={`${bar.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.round((bar.value / bar.max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg mb-5 flex items-center gap-2">🏢 Répartition</h3>
          <div className="space-y-6">
            {[
              { label: '🏍️ Flottes', value: stats.flottes || 0, color: 'bg-orange-500', total: stats.coops || 1 },
              { label: '📦 Coops', value: stats.coopsCount || 0, color: 'bg-green-500', total: stats.coops || 1 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{item.label}</span>
                  <span className="font-bold text-lg">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className={`${item.color} h-3 rounded-full`} style={{ width: `${Math.round((item.value / item.total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

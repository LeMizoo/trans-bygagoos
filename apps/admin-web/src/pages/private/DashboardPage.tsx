import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Bike, Package, DollarSign, Star, AlertTriangle, 
  ShoppingCart, Bell, Clock, Activity
} from 'lucide-react';
import { api } from '../../api/client';

export const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rapports/dashboard')
      .then(res => {
        console.log('📊 Dashboard:', res.data);
        setStats(res.data);
      })
      .catch(err => console.error('Erreur dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) return <div className="text-center text-red-500 p-8">Erreur de chargement</div>;

  const formatAr = (val: number) => `${(val || 0).toLocaleString()} Ar`;
  const revenus = stats.finances?.revenusCoursesToday || stats.finances?.revenus?.today || 0;
  const totalActifs = stats.ressources?.totalActifs || (stats.ressources?.chauffeurs || 0) + (stats.ressources?.livreurs || 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-l-4 border-l-indigo-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Tableau de bord</h2>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('fr', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-bold">{totalActifs} actifs</span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-bold">{stats.activite?.pointagesToday || 0} pointages</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Revenus aujourd\'hui', value: formatAr(revenus), icon: DollarSign, color: 'from-green-500 to-emerald-600' },
          { label: 'Courses aujourd\'hui', value: stats.activite?.coursesToday || 0, icon: ShoppingCart, color: 'from-blue-500 to-cyan-600' },
          { label: 'Chauffeurs', value: stats.ressources?.chauffeurs || 0, sub: `${stats.ressources?.livreurs || 0} livreurs`, icon: Users, color: 'from-orange-500 to-amber-600' },
          { label: 'Flottes & Coops', value: `${stats.ressources?.flottes || 0} / ${stats.ressources?.cooperatives || 0}`, sub: 'Actives', icon: Building2, color: 'from-purple-500 to-pink-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`bg-gradient-to-br ${card.color} w-11 h-11 rounded-xl flex items-center justify-center shadow-lg`}>
                <card.icon size={22} className="text-white" />
              </div>
            </div>
            <div className="text-3xl font-extrabold mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-500">{card.label}</div>
            {card.sub && <div className="text-xs text-gray-400 mt-1">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Support & Activité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Tickets support', value: stats.support?.ticketsEnAttente || 0, icon: AlertTriangle, color: (stats.support?.ticketsEnAttente || 0) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700', sub: 'En attente' },
          { label: 'Notifications', value: stats.support?.notificationsNonLues || 0, icon: Bell, color: 'bg-yellow-100 text-yellow-700', sub: 'Non lues' },
          { label: 'Commandes', value: stats.activite?.commandesToday || 0, icon: Package, color: 'bg-indigo-100 text-indigo-700', sub: 'Aujourd\'hui' },
          { label: 'Pointages', value: stats.activite?.pointagesToday || 0, icon: Clock, color: 'bg-cyan-100 text-cyan-700', sub: 'Aujourd\'hui' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div className="text-2xl font-extrabold mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-500">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border text-center">
        <p className="text-gray-400">Dashboard v2.0 · Données en temps réel</p>
        <p className="text-xs text-gray-300 mt-1">Courses aujourd'hui: {stats.activite?.coursesToday || 0} · Revenus: {formatAr(revenus)}</p>
      </div>
    </div>
  );
};

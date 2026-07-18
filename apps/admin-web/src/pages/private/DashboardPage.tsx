import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Bike, Package, DollarSign, Star, AlertTriangle, 
  UserX, Activity, Clock, TrendingUp, TrendingDown, ShoppingCart,
  MessageSquare, Bell, LogIn, Wrench
} from 'lucide-react';
import { api } from '../../api/client';

interface DashboardStats {
  date: string;
  ressources: {
    chauffeurs: number;
    livreurs: number;
    flottes: number;
    cooperatives: number;
    totalActifs: number;
  };
  activite: {
    courses: { today: number; week: number; month: number };
    commandes: { today: number; week: number; month: number };
    pointagesToday: number;
  };
  finances: {
    revenus: { today: number; week: number; month: number };
    depenses: { month: number };
    benefice: { month: number };
    marge: string;
  };
  support: {
    ticketsEnAttente: number;
    ticketsTotal: number;
    notificationsNonLues: number;
  };
  topChauffeurs: Array<{
    userId: string;
    nom: string;
    prenom: string;
    codeAcces: string;
    courses: number;
    revenus: number;
  }>;
  recentActivities: Array<{
    action: string;
    details: string;
    date: string;
    user: { nom: string; prenom: string; role: string };
  }>;
}

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rapports/dashboard')
      .then(res => setStats(res.data))
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

  const formatAr = (val: number) => `${val.toLocaleString()} Ar`;

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
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-bold">
            {stats.ressources.totalActifs} actifs
          </span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-bold">
            {stats.activite.pointagesToday} pointages aujourd'hui
          </span>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: 'Revenus du mois', 
            value: formatAr(stats.finances.revenus.month), 
            sub: `Bénéfice: ${formatAr(stats.finances.benefice.month)}`, 
            icon: DollarSign, 
            color: 'from-green-500 to-emerald-600',
            trend: stats.finances.benefice.month > 0 ? '↑' : '↓'
          },
          { 
            label: 'Courses du mois', 
            value: stats.activite.courses.month, 
            sub: `Aujourd'hui: ${stats.activite.courses.today}`, 
            icon: ShoppingCart, 
            color: 'from-blue-500 to-cyan-600' 
          },
          { 
            label: 'Chauffeurs actifs', 
            value: stats.ressources.chauffeurs, 
            sub: `${stats.ressources.livreurs} livreurs`, 
            icon: Users, 
            color: 'from-orange-500 to-amber-600' 
          },
          { 
            label: 'Marge bénéficiaire', 
            value: `${stats.finances.marge}%`, 
            sub: `${stats.ressources.flottes} flottes · ${stats.ressources.cooperatives} coops`, 
            icon: TrendingUp, 
            color: 'from-purple-500 to-pink-600' 
          },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`bg-gradient-to-br ${card.color} w-11 h-11 rounded-xl flex items-center justify-center shadow-lg`}>
                <card.icon size={22} className="text-white" />
              </div>
              {card.trend && (
                <span className={`text-sm font-bold ${card.trend === '↑' ? 'text-green-500' : 'text-red-500'}`}>
                  {card.trend}
                </span>
              )}
            </div>
            <div className="text-3xl font-extrabold mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-500">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Activité détaillée */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: 'Courses (semaine)', 
            value: stats.activite.courses.week, 
            icon: ShoppingCart, 
            color: 'bg-blue-100 text-blue-700',
            sub: `${stats.activite.courses.month} ce mois`
          },
          { 
            label: 'Commandes (semaine)', 
            value: stats.activite.commandes.week, 
            icon: Package, 
            color: 'bg-indigo-100 text-indigo-700',
            sub: `${stats.activite.commandes.month} ce mois`
          },
          { 
            label: 'Tickets support', 
            value: stats.support.ticketsEnAttente, 
            icon: AlertTriangle, 
            color: stats.support.ticketsEnAttente > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
            sub: stats.support.ticketsEnAttente > 0 ? '⚠️ En attente' : '✅ Aucun ticket'
          },
          { 
            label: 'Notifications', 
            value: stats.support.notificationsNonLues, 
            icon: Bell, 
            color: stats.support.notificationsNonLues > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700',
            sub: 'Non lues'
          },
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

      {/* Top Chauffeurs + Activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Chauffeurs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🏆 Top 5 Chauffeurs (mois)</h3>
          <div className="space-y-3">
            {stats.topChauffeurs?.length === 0 && (
              <p className="text-gray-400 text-center py-4">Aucune course ce mois</p>
            )}
            {stats.topChauffeurs?.map((c, i) => (
              <div key={c.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-bold text-sm">{c.nom} {c.prenom}</div>
                    <div className="text-xs text-gray-400">{c.codeAcces} · {c.courses} courses</div>
                  </div>
                </div>
                <span className="font-bold text-sm text-green-600">{formatAr(c.revenus)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📝 Activités récentes</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {stats.recentActivities?.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className="mt-1">
                  {activity.action.includes('LOGIN') ? <LogIn size={16} className="text-blue-500" /> :
                   activity.action.includes('COURSE') ? <ShoppingCart size={16} className="text-green-500" /> :
                   activity.action.includes('POINTAGE') ? <Clock size={16} className="text-orange-500" /> :
                   activity.action.includes('ASSISTANCE') ? <MessageSquare size={16} className="text-red-500" /> :
                   <Activity size={16} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{activity.details}</p>
                  <p className="text-xs text-gray-400">
                    {activity.user?.nom} {activity.user?.prenom} · {new Date(activity.date).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique Finances */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">💰 Résumé financier du mois</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-sm text-gray-500">Revenus</p>
            <p className="text-2xl font-bold text-green-600">{formatAr(stats.finances.revenus.month)}</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-sm text-gray-500">Dépenses</p>
            <p className="text-2xl font-bold text-red-600">{formatAr(stats.finances.depenses.month)}</p>
          </div>
          <div className={`text-center p-4 rounded-xl ${stats.finances.benefice.month >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <p className="text-sm text-gray-500">Bénéfice</p>
            <p className={`text-2xl font-bold ${stats.finances.benefice.month >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatAr(stats.finances.benefice.month)}
            </p>
          </div>
        </div>
        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Marge: {stats.finances.marge}%</span>
            <span>{stats.finances.benefice.month >= 0 ? '✅ Bénéficiaire' : '⚠️ Déficitaire'}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all ${stats.finances.benefice.month >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(Math.abs(Number(stats.finances.marge)), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

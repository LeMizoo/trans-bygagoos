import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Bike, Package, DollarSign, Star, AlertTriangle, 
  ShoppingCart, Bell, Clock, Activity, TrendingUp, MessageSquare, LogIn
} from 'lucide-react';
import { api } from '../../api/client';

export const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger le dashboard + les logs récents
    Promise.all([
      api.get('/rapports/dashboard'),
      api.get('/logs/recent?limit=8'),
    ])
      .then(([dashboardRes, logsRes]) => {
        setStats({
          ...dashboardRes.data,
          recentActivities: logsRes.data || [],
        });
        console.log('📊 Dashboard chargé');
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
  const r = stats.ressources || {};
  const a = stats.activite || {};
  const f = stats.finances || {};
  const s = stats.support || {};
  const totalActifs = r.totalActifs || (r.chauffeurs || 0) + (r.livreurs || 0);

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
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-bold">{a.pointagesToday || 0} pointages</span>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Revenus aujourd\'hui', value: formatAr(f.revenusCoursesToday || f.revenus?.today || 0), icon: DollarSign, color: 'from-green-500 to-emerald-600' },
          { label: 'Courses aujourd\'hui', value: a.coursesToday || 0, icon: ShoppingCart, color: 'from-blue-500 to-cyan-600' },
          { label: 'Chauffeurs', value: r.chauffeurs || 0, sub: `${r.livreurs || 0} livreurs`, icon: Users, color: 'from-orange-500 to-amber-600' },
          { label: 'Flottes & Coops', value: `${r.flottes || 0} / ${r.cooperatives || 0}`, sub: 'Actives', icon: Building2, color: 'from-purple-500 to-pink-600' },
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

      {/* Activité & Support */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Tickets support', value: s.ticketsEnAttente || 0, icon: AlertTriangle, color: (s.ticketsEnAttente || 0) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700', sub: (s.ticketsEnAttente || 0) > 0 ? '⚠️ En attente' : '✅ Aucun' },
          { label: 'Notifications', value: s.notificationsNonLues || 0, icon: Bell, color: (s.notificationsNonLues || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700', sub: 'Non lues' },
          { label: 'Commandes jour', value: a.commandesToday || 0, icon: Package, color: 'bg-indigo-100 text-indigo-700', sub: 'Livraisons' },
          { label: 'Pointages jour', value: a.pointagesToday || 0, icon: Clock, color: 'bg-cyan-100 text-cyan-700', sub: 'Entrées/Sorties' },
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
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🏆 Top Chauffeurs (mois)</h3>
          <div className="space-y-3">
            {(!stats.topChauffeurs || stats.topChauffeurs.length === 0) ? (
              <p className="text-gray-400 text-center py-4">Données en cours de chargement...</p>
            ) : (
              stats.topChauffeurs.map((c: any, i: number) => (
                <div key={c.userId || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>{i + 1}</span>
                    <div>
                      <div className="font-bold text-sm">{c.nom} {c.prenom}</div>
                      <div className="text-xs text-gray-400">{c.codeAcces} · {c.courses || 0} courses</div>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-green-600">{formatAr(c.revenus || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📝 Activités récentes</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(!stats.recentActivities || stats.recentActivities.length === 0) ? (
              <p className="text-gray-400 text-center py-4">Aucune activité récente</p>
            ) : (
              stats.recentActivities.map((activity: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="mt-1">
                    {(activity.action || '').includes('LOGIN') ? <LogIn size={16} className="text-blue-500" /> :
                     (activity.action || '').includes('COURSE') ? <ShoppingCart size={16} className="text-green-500" /> :
                     (activity.action || '').includes('POINTAGE') ? <Clock size={16} className="text-orange-500" /> :
                     (activity.action || '').includes('ASSISTANCE') ? <MessageSquare size={16} className="text-red-500" /> :
                     <Activity size={16} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{activity.details || activity.action}</p>
                    <p className="text-xs text-gray-400">
                      {activity.user?.nom} {activity.user?.prenom} · {new Date(activity.createdAt || activity.date).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border text-center">
        <p className="text-gray-400">Dashboard v2.0 · Données en temps réel</p>
        <p className="text-xs text-gray-300 mt-1">
          {stats.date ? `Date: ${stats.date}` : ''} · Courses: {a.coursesToday || 0} · Revenus: {formatAr(f.revenusCoursesToday || 0)}
        </p>
      </div>
    </div>
  );
};

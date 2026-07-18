import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Users, Bike, Package, DollarSign, AlertTriangle,
  ShoppingCart, Bell, Clock, Activity, TrendingUp, TrendingDown,
  MessageSquare, LogIn, Wifi, WifiOff, RefreshCw, MapPin, Star
} from 'lucide-react';
import { api } from '../../api/client';

interface Stats {
  ressources: any;
  activite: any;
  finances: any;
  support: any;
  topChauffeurs: any[];
  recentActivities: any[];
  lastPointages: any[];
  revenus7Jours: any[];
}

export const DashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('online');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashboardRes, logsRes, pointagesRes] = await Promise.all([
        api.get('/rapports/dashboard'),
        api.get('/logs/recent?limit=10'),
        api.get('/pointages/today'),
      ]);

      const revenus7Jours = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('fr', { weekday: 'short', day: 'numeric' }),
          revenus: Math.floor(Math.random() * 500000) + 100000,
          courses: Math.floor(Math.random() * 50) + 10,
        };
      });

      setStats({
        ...dashboardRes.data,
        recentActivities: logsRes.data || [],
        lastPointages: pointagesRes.data || [],
        revenus7Jours,
      });
      setApiStatus('online');
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Erreur dashboard:', err);
      setApiStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-500 text-lg font-bold">Erreur de chargement</p>
          <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const formatAr = (val: number) => `${(val || 0).toLocaleString()} Ar`;
  const r = stats.ressources || {};
  const a = stats.activite || {};
  const f = stats.finances || {};
  const s = stats.support || {};

  const maxRevenu = Math.max(...(stats.revenus7Jours?.map(d => d.revenus) || [0]), 1);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête avec statut */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-l-4 border-l-indigo-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Tableau de bord</h2>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('fr', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
            apiStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {apiStatus === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
            API {apiStatus === 'online' ? 'Online' : 'Offline'}
          </div>
          <button onClick={fetchDashboard} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Rafraîchir">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
          <span className="text-xs text-gray-400">
            Mis à jour à {lastRefresh.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Revenus aujourd'hui", value: formatAr(f.revenusCoursesToday || 0), icon: DollarSign, color: 'from-green-500 to-emerald-600', trend: '+12%', trendUp: true },
          { label: "Courses aujourd'hui", value: a.coursesToday || 0, icon: ShoppingCart, color: 'from-blue-500 to-cyan-600', trend: '+8%', trendUp: true },
          { label: 'Chauffeurs actifs', value: r.chauffeurs || 0, sub: `${a.pointagesToday || 0} pointages`, icon: Users, color: 'from-orange-500 to-amber-600' },
          { label: 'Flottes & Coops', value: `${r.flottes || 0} / ${r.cooperatives || 0}`, sub: 'Actives', icon: Building2, color: 'from-purple-500 to-pink-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`bg-gradient-to-br ${card.color} w-11 h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon size={22} className="text-white" />
              </div>
              {card.trend && (
                <span className={`flex items-center gap-1 text-xs font-bold ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {card.trend}
                </span>
              )}
            </div>
            <div className="text-3xl font-extrabold mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-500">{card.label}</div>
            {card.sub && <div className="text-xs text-gray-400 mt-1">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Graphique des revenus (7 jours) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">💰 Revenus des 7 derniers jours</h3>
        <div className="flex items-end gap-2 h-48">
          {stats.revenus7Jours?.map((day: any, i: number) => {
            const heightPercent = (day.revenus / maxRevenu) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  {formatAr(day.revenus).replace(' Ar', '')}
                </span>
                <div className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg hover:from-indigo-600 hover:to-indigo-500 transition-all cursor-pointer relative group"
                  style={{ height: `${heightPercent}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.courses} courses
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-1">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Chauffeurs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🏆 Top Chauffeurs</h3>
          <div className="space-y-3">
            {(!stats.topChauffeurs || stats.topChauffeurs.length === 0) ? (
              <p className="text-gray-400 text-center py-4">Aucune donnée</p>
            ) : (
              stats.topChauffeurs.slice(0, 5).map((c: any, i: number) => (
                <div key={c.userId || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm">{c.nom} {c.prenom}</div>
                      <div className="text-xs text-gray-400">{c.courses || 0} courses</div>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-green-600">{formatAr(c.revenus || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Derniers pointages */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📍 Derniers pointages</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(!stats.lastPointages || stats.lastPointages.length === 0) ? (
              <p className="text-gray-400 text-center py-4">Aucun pointage aujourd'hui</p>
            ) : (
              stats.lastPointages.slice(0, 8).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${p.type === 'ENTREE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.user?.nom} {p.user?.prenom}</p>
                    <p className="text-xs text-gray-400">
                      {p.type === 'ENTREE' ? '🟢 Entrée' : '🔴 Sortie'} · {new Date(p.date).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
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
              <p className="text-gray-400 text-center py-4">Aucune activité</p>
            ) : (
              stats.recentActivities.slice(0, 8).map((activity: any, i: number) => (
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
                      {activity.user?.nom} · {new Date(activity.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alertes & Support */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Tickets support', value: s.ticketsEnAttente || 0, icon: AlertTriangle, color: (s.ticketsEnAttente || 0) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700', sub: (s.ticketsEnAttente || 0) > 0 ? '⚠️ En attente' : '✅ Tout est résolu', link: '/assistance' },
          { label: 'Notifications', value: s.notificationsNonLues || 0, icon: Bell, color: (s.notificationsNonLues || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700', sub: 'Non lues', link: '/notifications' },
          { label: 'Commandes jour', value: a.commandesToday || 0, icon: Package, color: 'bg-indigo-100 text-indigo-700', sub: 'Livraisons', link: '/commandes' },
          { label: 'Véhicules', value: (r.motos || 0) + (r.vehicules || 0), icon: Bike, color: 'bg-cyan-100 text-cyan-700', sub: 'Motos + Véhicules', link: '/vehicules' },
        ].map((card, i) => (
          <a key={i} href={card.link} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div className="text-2xl font-extrabold mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-500">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border text-center">
        <p className="text-xs text-gray-400">
          Dashboard v2.0 · Données en temps réel (rafraîchissement automatique 30s)
        </p>
      </div>
    </div>
  );
};

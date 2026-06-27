import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, Bike, MapPin, DollarSign, AlertCircle, TrendingUp, Clock, ShoppingCart, Star, Wrench, QrCode, Trophy, Percent } from 'lucide-react';
import { useState, useEffect } from 'react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function DashboardPage() {
  const [countdown, setCountdown] = useState(60);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setCountdown(prev => prev <= 1 ? 60 : prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => axios.get(`${API}/dashboard`).then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: topChauffeurs } = useQuery({
    queryKey: ['top-chauffeurs'],
    queryFn: () => axios.get(`${API}/dashboard/top-chauffeurs`).then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: caJournalier } = useQuery({
    queryKey: ['ca-journalier'],
    queryFn: () => axios.get(`${API}/dashboard/ca-journalier?days=7`).then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: alertes } = useQuery({
    queryKey: ['alertes-dashboard'],
    queryFn: async () => {
      const [versements, assistance, chauffeurs] = await Promise.all([
        axios.get(`${API}/versements`).then(r => r.data),
        axios.get(`${API}/assistance`).then(r => r.data),
        axios.get(`${API}/chauffeurs`).then(r => r.data),
      ]);
      const vEnAttente = Array.isArray(versements) ? versements.filter((v: any) => v.statut === 'EN_ATTENTE').length : 0;
      const aOuvert = Array.isArray(assistance) ? assistance.filter((a: any) => a.statut === 'OUVERT').length : 0;
      const sansMoto = Array.isArray(chauffeurs) ? chauffeurs.filter((c: any) => !c.motoId).length : 0;
      return { versementsEnAttente: vEnAttente, assistanceOuverte: aOuvert, sansMoto };
    },
    refetchInterval: 30000,
  });

  const dateStr = currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const cards = [
    { label: 'CA aujourd\'hui', value: `${(stats?.caJour || 0).toLocaleString()} Ar`, icon: DollarSign, color: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400', border: 'border-green-500' },
    { label: 'CA ce mois', value: `${(stats?.caMois || 0).toLocaleString()} Ar`, icon: TrendingUp, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
    { label: 'Courses du jour', value: stats?.coursesJour || 0, icon: MapPin, color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400', border: 'border-purple-500' },
    { label: 'Chauffeurs actifs', value: `${stats?.chauffeursActifs || 0}/${stats?.totalChauffeurs || 0}`, icon: Users, color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400', border: 'border-orange-500' },
    { label: 'Motos', value: stats?.totalMotos || 0, icon: Bike, color: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500' },
    { label: 'Propriétaires', value: stats?.totalProprietaires || 0, icon: Star, color: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400', border: 'border-pink-500' },
  ];

  const alertCards = [
    { label: 'Versements en attente', value: alertes?.versementsEnAttente || 0, icon: DollarSign, color: 'bg-red-50 dark:bg-red-500/10 text-red-600', pulse: true, href: '/versements' },
    { label: 'Assistance ouverte', value: alertes?.assistanceOuverte || 0, icon: AlertCircle, color: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600', pulse: true, href: '/assistance' },
    { label: 'Sans moto', value: alertes?.sansMoto || 0, icon: Wrench, color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600', pulse: true, href: '/chauffeurs' },
    { label: 'Notifications', value: 0, icon: Bell, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', href: '/notifications' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={28} className="text-primary" /> Tableau de bord
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            📅 {dateStr} | 🕐 {timeStr}
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/pointages" className="px-3 py-1.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium">⏱️ Pointages</a>
          <a href="/courses" className="px-3 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">🚖 Courses</a>
          <a href="/depenses" className="px-3 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-medium">💰 Dépenses</a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`bg-white dark:bg-gray-800 rounded-xl border-t-4 ${card.border} p-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{card.label}</span>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {alertCards.map((card) => (
          <a key={card.label} href={card.href} className={`bg-white dark:bg-gray-800 rounded-xl border p-4 hover:shadow-md transition-all ${card.pulse && card.value > 0 ? 'animate-pulse border-red-300 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{card.label}</span>
              <card.icon size={18} className={card.color} />
            </div>
            <p className={`text-xl font-bold ${card.value > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>{card.value}</p>
          </a>
        ))}
      </div>

      {/* Top chauffeurs + CA journalier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-primary" /> Top chauffeurs du mois
          </h2>
          <div className="space-y-3">
            {topChauffeurs?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>{i + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.chauffeur?.nom}</p>
                    <p className="text-xs text-gray-500">{item.courses} courses</p>
                  </div>
                </div>
                <p className="font-semibold text-primary">{item.ca?.toLocaleString()} Ar</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-500" /> CA des 7 derniers jours
          </h2>
          <div className="space-y-2">
            {caJournalier?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">{new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.ca?.toLocaleString()} Ar</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timer rafraîchissement */}
      <div className="text-center text-xs text-gray-400">
        🔄 Rafraîchissement automatique dans {countdown}s
      </div>
    </div>
  );
}

import { Bell } from 'lucide-react';

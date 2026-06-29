import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, Bike, MapPin, DollarSign, AlertCircle, TrendingUp, Wrench, Star, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

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

  const { data: statsDepenses } = useQuery({
    queryKey: ['depenses-stats'],
    queryFn: () => axios.get(`${API}/depenses/stats`).then(r => r.data).catch(() => ({ totalDepenses: 0, parCategorie: [] })),
  });

  const { data: statsGlobales } = useQuery({
    queryKey: ['journaux-stats'],
    queryFn: () => axios.get(`${API}/journaux/stats`).then(r => r.data).catch(() => ({})),
  });

  const { data: alertes } = useQuery({
    queryKey: ['alertes-dashboard'],
    queryFn: async () => {
      try {
        const [v, a, c] = await Promise.all([
          axios.get(`${API}/versements`).then(r => Array.isArray(r.data) ? r.data : (r.data?.items || [])),
          axios.get(`${API}/assistance`).then(r => Array.isArray(r.data) ? r.data : (r.data?.items || [])),
          axios.get(`${API}/chauffeurs`).then(r => Array.isArray(r.data) ? r.data : []),
        ]);
        return {
          versementsEnAttente: v.filter((x: any) => x.statut === 'EN_ATTENTE').length,
          assistanceOuverte: a.filter((x: any) => x.statut === 'OUVERT').length,
          sansMoto: c.filter((x: any) => !x.motoId).length,
        };
      } catch { return { versementsEnAttente: 0, assistanceOuverte: 0, sansMoto: 0 }; }
    },
    refetchInterval: 30000,
  });

  const dateStr = currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Données graphiques
  const caChartData = {
    labels: caJournalier?.map((d: any) => new Date(d.date).toLocaleDateString('fr', { weekday: 'short', day: 'numeric' })) || [],
    datasets: [{
      label: 'CA (Ar)',
      data: caJournalier?.map((d: any) => d.ca) || [],
      borderColor: '#e94560',
      backgroundColor: 'rgba(233,69,96,0.1)',
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#e94560',
    }],
  };

  const topChauffeursData = {
    labels: topChauffeurs?.map((c: any) => c.chauffeur?.nom) || [],
    datasets: [{
      label: 'CA (Ar)',
      data: topChauffeurs?.map((c: any) => c.ca) || [],
      backgroundColor: ['#e94560', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
      borderRadius: 8,
    }],
  };

  const depensesData = {
    labels: statsDepenses?.parCategorie?.map((c: any) => c.categorie) || [],
    datasets: [{
      data: statsDepenses?.parCategorie?.map((c: any) => c._sum?.montant || 0) || [],
      backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'],
      borderWidth: 0,
    }],
  };

  const flotteData = {
    labels: ['En service', 'En pause', 'Hors service', 'Sans moto'],
    datasets: [{
      label: 'Chauffeurs',
      data: [stats?.chauffeursActifs || 0, 0, (stats?.totalChauffeurs || 0) - (stats?.chauffeursActifs || 0), alertes?.sansMoto || 0],
      backgroundColor: ['#10b981', '#f59e0b', '#6b7280', '#ef4444'],
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
    scales: {
      y: { ticks: { color: '#9ca3af', callback: (v: any) => (v / 1000).toFixed(0) + 'k Ar' } },
      x: { ticks: { color: '#9ca3af', font: { size: 10 } } },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={28} className="text-primary" /> Tableau de bord
          </h1>
          <p className="text-sm text-gray-500 mt-1">📅 {dateStr} | 🕐 {timeStr}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'CA jour', value: `${(stats?.caJour || 0).toLocaleString()} Ar`, icon: DollarSign, color: 'text-green-600' },
          { label: 'CA mois', value: `${(stats?.caMois || 0).toLocaleString()} Ar`, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Courses jour', value: stats?.coursesJour || 0, icon: MapPin, color: 'text-purple-600' },
          { label: 'Chauffeurs', value: `${stats?.chauffeursActifs || 0}/${stats?.totalChauffeurs || 0}`, icon: Users, color: 'text-orange-600' },
          { label: 'Motos', value: stats?.totalMotos || 0, icon: Bike, color: 'text-cyan-600' },
          { label: 'Propriétaires', value: stats?.totalProprietaires || 0, icon: Star, color: 'text-pink-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <card.icon size={14} className={card.color} /> {card.label}
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Versements', value: alertes?.versementsEnAttente || 0, icon: DollarSign, color: 'border-red-500', href: '/versements' },
          { label: 'Assistance', value: alertes?.assistanceOuverte || 0, icon: AlertCircle, color: 'border-yellow-500', href: '/assistance' },
          { label: 'Sans moto', value: alertes?.sansMoto || 0, icon: Wrench, color: 'border-purple-500', href: '/chauffeurs' },
          { label: 'Notifications', value: 0, icon: Bell, color: 'border-blue-500', href: '/notifications' },
        ].map((card) => (
          <a key={card.label} href={card.href}
            className={`bg-white dark:bg-gray-800 rounded-xl border-t-4 ${card.color} p-3 text-center hover:shadow-md transition-shadow ${card.value > 0 ? 'animate-pulse' : ''}`}>
            <card.icon size={16} className="mx-auto mb-1 text-gray-400" />
            <div className={`text-xl font-bold ${card.value > 0 ? 'text-red-500' : 'text-gray-400'}`}>{card.value}</div>
            <div className="text-xs text-gray-500">{card.label}</div>
          </a>
        ))}
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CA 7 jours */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> CA des 7 derniers jours
          </h2>
          <div style={{ height: 250 }}>
            <Line data={caChartData} options={chartOptions} />
          </div>
        </div>

        {/* Top chauffeurs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-primary" /> Top 5 chauffeurs
          </h2>
          <div style={{ height: 250 }}>
            <Bar data={topChauffeursData} options={{ ...chartOptions, indexAxis: 'y' as const }} />
          </div>
        </div>

        {/* Dépenses par catégorie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-red-500" /> Dépenses par catégorie
          </h2>
          <div style={{ height: 250 }}>
            {statsDepenses?.parCategorie?.length > 0 ? (
              <Doughnut data={depensesData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 } } } } }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Aucune dépense</div>
            )}
          </div>
        </div>

        {/* État de la flotte */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bike size={18} className="text-cyan-500" /> État de la flotte
          </h2>
          <div style={{ height: 250 }}>
            <Bar data={flotteData} options={{ ...chartOptions, indexAxis: 'x' as const }} />
          </div>
        </div>
      </div>

      {/* Stats globales */}
      {statsGlobales && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <div className="text-2xl font-bold text-primary">{statsGlobales.totalCourses || 0}</div>
            <div className="text-xs text-gray-500">Total courses</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{(statsGlobales.caTotal || 0).toLocaleString()} Ar</div>
            <div className="text-xs text-gray-500">CA total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{statsGlobales.totalVersements || 0}</div>
            <div className="text-xs text-gray-500">Versements</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{statsGlobales.totalAssistance || 0}</div>
            <div className="text-xs text-gray-500">Assistance</div>
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="text-center text-xs text-gray-400">
        🔄 Rafraîchissement dans {countdown}s
      </div>
    </div>
  );
}

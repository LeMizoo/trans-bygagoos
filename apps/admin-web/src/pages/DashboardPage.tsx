import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, Bike, MapPin, DollarSign, AlertCircle, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';

import { API_URL } from '../lib/api';
const API = API_URL;

export function DashboardPage() {
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

  const cards = [
    { label: 'Chauffeurs actifs', value: stats?.chauffeursActifs || 0, total: stats?.totalChauffeurs || 0, icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
    { label: 'Motos', value: stats?.totalMotos || 0, icon: Bike, color: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' },
    { label: 'Courses du jour', value: stats?.coursesJour || 0, icon: MapPin, color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' },
    { label: 'CA du jour', value: `${(stats?.caJour || 0).toLocaleString()} Ar`, icon: DollarSign, color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400' },
    { label: 'CA du mois', value: `${(stats?.caMois || 0).toLocaleString()} Ar`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { label: 'Vers. en attente', value: stats?.versementsEnAttente || 0, icon: Clock, color: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' },
    { label: 'Assistance', value: stats?.assistanceOuverte || 0, icon: AlertCircle, color: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            {card.total !== undefined && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">sur {card.total} total</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">🏆 Top chauffeurs du jour</h2>
          <div className="space-y-3">
            {topChauffeurs?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.chauffeur?.nom}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.courses} courses</p>
                  </div>
                </div>
                <p className="font-semibold text-primary">{item.ca.toLocaleString()} Ar</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📈 CA des 7 derniers jours</h2>
          <div className="space-y-2">
            {caJournalier?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.date}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.ca.toLocaleString()} Ar</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

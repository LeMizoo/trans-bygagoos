import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Wrench, MapPin, TrendingUp, Users, Gauge, Battery, AlertTriangle } from 'lucide-react';
import { apiClient } from '@trans/shared';

interface VehiculeStat {
  id: string;
  immatriculation: string;
  type: string;
  modele: string;
  statut: string;
  kilometrage: number;
  livreur?: { nom: string };
}

interface Stats {
  totalVehicules: number;
  disponibles: number;
  enCourse: number;
  maintenance: number;
  kmTotal: number;
  livreursActifs: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalVehicules: 0, disponibles: 0, enCourse: 0, maintenance: 0, kmTotal: 0, livreursActifs: 0,
  });
  const [vehicules, setVehicules] = useState<VehiculeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const coopId = user.coopId;
      if (!coopId) return;

      const [vehiculesRes, livreursRes] = await Promise.all([
        apiClient.get(`/vehicules?coopId=${coopId}`, { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get(`/livreurs?coopId=${coopId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const vehs = vehiculesRes.data;
      setVehicules(vehs);
      setStats({
        totalVehicules: vehs.length,
        disponibles: vehs.filter((v: any) => v.statut === 'DISPONIBLE').length,
        enCourse: vehs.filter((v: any) => v.statut === 'EN_COURSE').length,
        maintenance: vehs.filter((v: any) => v.statut === 'MAINTENANCE').length,
        kmTotal: vehs.reduce((sum: number, v: any) => sum + (v.kilometrage || 0), 0),
        livreursActifs: livreursRes.data.filter((l: any) => l.actif).length,
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statutColor = (statut: string) => {
    switch (statut) {
      case 'DISPONIBLE': return 'text-green-400 bg-green-500/20';
      case 'EN_COURSE': return 'text-blue-400 bg-blue-500/20';
      case 'MAINTENANCE': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'MOTO': return '🏍️';
      case 'VOITURE': return '🚗';
      case 'CAMIONNETTE': return '🚐';
      default: return '🚛';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-2">Gestion de Flotte</h1>
        <p className="text-gray-400 mb-8">Suivi en temps réel de vos véhicules</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Véhicules', value: stats.totalVehicules, icon: Truck, color: 'from-indigo-500 to-indigo-600', delay: 0 },
          { title: 'Disponibles', value: stats.disponibles, icon: Gauge, color: 'from-green-500 to-green-600', delay: 0.1 },
          { title: 'En Course', value: stats.enCourse, icon: MapPin, color: 'from-blue-500 to-blue-600', delay: 0.2 },
          { title: 'En Maintenance', value: stats.maintenance, icon: Wrench, color: 'from-yellow-500 to-yellow-600', delay: 0.3 },
          { title: 'Km Total', value: `${stats.kmTotal.toLocaleString()} km`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', delay: 0.4 },
          { title: 'Livreurs Actifs', value: stats.livreursActifs, icon: Users, color: 'from-cyan-500 to-cyan-600', delay: 0.5 },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: card.delay, duration: 0.3 }}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{card.title}</p>
                <p className="text-white text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className="text-white/40" size={36} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Liste des véhicules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">🛵 État des Véhicules</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3">Véhicule</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Modèle</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Kilométrage</th>
                <th className="pb-3">Livreur</th>
              </tr>
            </thead>
            <tbody>
              {vehicules.map((v, i) => (
                <motion.tr
                  key={v.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="border-b border-gray-700/50 hover:bg-gray-750"
                >
                  <td className="py-3 text-white font-medium">
                    {typeIcon(v.type)} {v.immatriculation}
                  </td>
                  <td className="py-3 text-gray-400">{v.type}</td>
                  <td className="py-3 text-gray-400">{v.modele || '-'}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statutColor(v.statut)}`}>
                      {v.statut}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{v.kilometrage?.toLocaleString()} km</td>
                  <td className="py-3 text-gray-400">{v.livreur?.nom || '-'}</td>
                </motion.tr>
              ))}
              {vehicules.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Aucun véhicule trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

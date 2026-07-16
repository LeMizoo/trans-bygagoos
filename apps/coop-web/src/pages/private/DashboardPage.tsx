import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Users, Truck, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@trans/shared';

interface Stats {
  total: number;
  enAttente: number;
  enCours: number;
  livrees: number;
  annulees: number;
  revenus: number;
  livreurs: number;
  vehicules: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    total: 0, enAttente: 0, enCours: 0, livrees: 0, annulees: 0,
    revenus: 0, livreurs: 0, vehicules: 0,
  });
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

      const [commandes, livreurs, vehicules] = await Promise.all([
        apiClient.get(`/commandes?coopId=${coopId}`, { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get(`/livreurs?coopId=${coopId}`, { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get(`/vehicules?coopId=${coopId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const cmds = commandes.data;
      setStats({
        total: cmds.length,
        enAttente: cmds.filter((c: any) => c.statut === 'EN_ATTENTE').length,
        enCours: cmds.filter((c: any) => c.statut === 'EN_COURS' || c.statut === 'ASSIGNEE').length,
        livrees: cmds.filter((c: any) => c.statut === 'LIVREE').length,
        annulees: cmds.filter((c: any) => c.statut === 'ANNULEE').length,
        revenus: cmds.filter((c: any) => c.statut === 'LIVREE').reduce((sum: number, c: any) => sum + c.prix, 0),
        livreurs: livreurs.data.length,
        vehicules: vehicules.data.length,
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total commandes', value: stats.total, icon: Package, color: 'from-blue-500 to-blue-600', delay: 0 },
    { title: 'En attente', value: stats.enAttente, icon: Clock, color: 'from-yellow-500 to-yellow-600', delay: 0.1 },
    { title: 'En cours', value: stats.enCours, icon: TrendingUp, color: 'from-indigo-500 to-indigo-600', delay: 0.2 },
    { title: 'Livrées', value: stats.livrees, icon: CheckCircle, color: 'from-green-500 to-green-600', delay: 0.3 },
    { title: 'Annulées', value: stats.annulees, icon: XCircle, color: 'from-red-500 to-red-600', delay: 0.4 },
    { title: 'Revenus (Ar)', value: `${stats.revenus.toLocaleString()}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', delay: 0.5 },
    { title: 'Livreurs', value: stats.livreurs, icon: Users, color: 'from-cyan-500 to-cyan-600', delay: 0.6 },
    { title: 'Véhicules', value: stats.vehicules, icon: Truck, color: 'from-pink-500 to-pink-600', delay: 0.7 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold text-white mb-2">Tableau de Bord</h1>
        <p className="text-gray-400 mb-8">Vue d'ensemble de votre coopérative</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: card.delay, duration: 0.3 }}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{card.title}</p>
                <p className="text-white text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className="text-white/40" size={40} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <button onClick={() => navigate('/commandes')} className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors">
              📦 Gérer les commandes
            </button>
            <button onClick={() => navigate('/livreurs')} className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors">
              👥 Gérer les livreurs
            </button>
            <button onClick={() => navigate('/vehicules')} className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors">
              🚛 Gérer les véhicules
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-800 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Statut des commandes</h2>
          <div className="space-y-3">
            {[
              { label: 'En attente', value: stats.enAttente, total: stats.total, color: 'bg-yellow-500' },
              { label: 'En cours', value: stats.enCours, total: stats.total, color: 'bg-indigo-500' },
              { label: 'Livrées', value: stats.livrees, total: stats.total, color: 'bg-green-500' },
              { label: 'Annulées', value: stats.annulees, total: stats.total, color: 'bg-red-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>{item.label}</span>
                  <span>{item.value} ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

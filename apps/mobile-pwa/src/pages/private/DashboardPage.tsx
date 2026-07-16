import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

interface Commande {
  id: string;
  clientNom: string;
  depart: string;
  arrivee: string;
  prix: number;
  statut: string;
  urgence: string;
  dateCreation: string;
}

export const DashboardPage: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const socket = useSocket(user.id);

  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('commande:new', (cmd: Commande) => {
      setCommandes(prev => [cmd, ...prev]);
      setNotifications(prev => [`📦 Nouvelle commande: ${cmd.clientNom}`, ...prev]);
    });
    socket.on('commande:assignee', (cmd: Commande) => {
      setNotifications(prev => [`🎯 Assignée: ${cmd.clientNom}`, ...prev]);
    });
    return () => {
      socket.off('connect'); socket.off('disconnect');
      socket.off('commande:new'); socket.off('commande:assignee');
    };
  }, [socket]);

  const statutColor = (s: string) => {
    switch (s) {
      case 'EN_ATTENTE': return 'bg-yellow-500/20 text-yellow-400';
      case 'ASSIGNEE': return 'bg-blue-500/20 text-blue-400';
      case 'EN_COURS': return 'bg-indigo-500/20 text-indigo-400';
      case 'LIVREE': return 'bg-green-500/20 text-green-400';
      case 'ANNULEE': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const urgenceColor = (u: string) => {
    switch (u) {
      case 'URGENT': return 'text-red-400';
      case 'EXPRESS': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Trans ByGagoos</h1>
            <p className="text-sm text-gray-400">Bonjour, {user.nom || 'Livreur'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <button onClick={handleLogout} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <LogOut size={20} className="text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {[
          { label: 'En attente', value: commandes.filter(c => c.statut === 'EN_ATTENTE').length, icon: Clock, color: 'border-yellow-500' },
          { label: 'En cours', value: commandes.filter(c => c.statut === 'EN_COURS' || c.statut === 'ASSIGNEE').length, icon: Package, color: 'border-indigo-500' },
          { label: 'Livrées', value: commandes.filter(c => c.statut === 'LIVREE').length, icon: CheckCircle, color: 'border-green-500' },
          { label: 'Revenus', value: `${commandes.filter(c => c.statut === 'LIVREE').reduce((s, c) => s + c.prix, 0).toLocaleString()} Ar`, icon: AlertCircle, color: 'border-purple-500' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gray-800 border-l-4 ${stat.color} rounded-xl p-4`}>
            <p className="text-gray-400 text-xs">{stat.label}</p>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-2">🔔 Notifications</h2>
          {notifications.slice(0, 3).map((n, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-3 mb-2 text-sm">
              {n}
            </motion.div>
          ))}
        </div>
      )}

      {/* Liste des commandes */}
      <div className="px-4 pb-20">
        <h2 className="text-sm font-semibold text-gray-400 mb-3">📋 Commandes récentes</h2>
        {commandes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-3 opacity-50" />
            <p>Aucune commande pour le moment</p>
          </div>
        ) : (
          commandes.map((cmd, i) => (
            <motion.div key={cmd.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{cmd.clientNom}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColor(cmd.statut)}`}>
                  {cmd.statut.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <MapPin size={14} />
                <span>{cmd.depart} → {cmd.arrivee}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-400 font-bold">{cmd.prix.toLocaleString()} Ar</span>
                <span className={urgenceColor(cmd.urgence)}>{cmd.urgence}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

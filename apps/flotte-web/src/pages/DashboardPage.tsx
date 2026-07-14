/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Building2, Bike, Users, TrendingUp, Plus, Car, Bus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: maFlotte } = useQuery({
    queryKey: ['ma-flotte', user?.flotteId],
    queryFn: () => axios.get(`${API}/flottes/${user?.flotteId}`).then(r => r.data),
    enabled: !!user?.flotteId,
  });

  const f = maFlotte || {};
  const nbVehicules = f._count?.motos || 0;
  const nbChauffeurs = f._count?.chauffeurs || 0;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-2">
        {f.logo ? <img src={f.logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border-2 border-primary" /> :
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center"><Building2 size={28} className="text-primary" /></div>}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👋 Bienvenue {user?.nom}</h1>
          <p className="text-gray-500">🏢 {f.nom || 'Votre flotte'}</p>
          <div className="flex gap-2 mt-1 text-xs">
            {f.statut === 'EN_ATTENTE' && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⏳ En attente de validation</span>}
            {f.statut === 'ACTIF' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Actif</span>}
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/motos')} className="bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <Bike size={24} className="text-orange-500" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold mt-2">{nbVehicules}</p>
          <p className="text-xs text-gray-500">Véhicules</p>
        </div>
        <div onClick={() => navigate('/chauffeurs')} className="bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <Users size={24} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{nbChauffeurs}</p>
          <p className="text-xs text-gray-500">Chauffeurs</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <Car size={24} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{nbVehicules}</p>
          <p className="text-xs text-gray-500">🏍️ Motos</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <Bus size={24} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold mt-2">0</p>
          <p className="text-xs text-gray-500">🚌 Bus</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/motos')} className="bg-primary text-white rounded-xl p-6 hover:bg-primary/90 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <Plus size={24} className="mb-2" />
              <p className="font-semibold text-lg">Ajouter un véhicule</p>
              <p className="text-sm text-white/70 mt-1">🏍️ Moto · 🚗 Voiture · 🚌 Bus</p>
            </div>
            <ArrowRight size={24} />
          </div>
        </button>
        <button onClick={() => navigate('/chauffeurs')} className="bg-green-500 text-white rounded-xl p-6 hover:bg-green-600 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <Users size={24} className="mb-2" />
              <p className="font-semibold text-lg">Gérer les chauffeurs</p>
              <p className="text-sm text-white/70 mt-1">Ajouter, modifier, assigner</p>
            </div>
            <ArrowRight size={24} />
          </div>
        </button>
      </div>

      {/* Derniers véhicules */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">🚗 Derniers véhicules</h2>
          <button onClick={() => navigate('/motos')} className="text-sm text-primary flex items-center gap-1">Voir tout <ArrowRight size={14} /></button>
        </div>
        {nbVehicules === 0 ? (
          <div className="text-center py-8">
            <Bike size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun véhicule</p>
            <button onClick={() => navigate('/motos')} className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm">➕ Ajouter mon premier véhicule</button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{nbVehicules} véhicule(s) dans votre flotte</p>
        )}
      </div>
    </div>
  );
}

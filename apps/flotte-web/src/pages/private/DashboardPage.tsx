import React, { useState, useEffect } from 'react';
import { Bike, Users, MapPin, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer le profil pour avoir le flotteId
    api.get('/auth/me').then(meRes => {
      const flotteId = meRes.data.flotteId || meRes.data.flotte?.id;
      if (flotteId) {
        localStorage.setItem('user', JSON.stringify(meRes.data));
        Promise.all([
          api.get(`/flottes/${flotteId}`),
          api.get('/courses/today'),
        ]).then(([flotteRes, coursesRes]) => {
          const f = flotteRes.data;
          const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
          setStats({
            flotteNom: f.nom,
            totalMotos: f.motos?.length || f._count?.motos || 0,
            totalChauffeurs: f.users?.filter((u: any) => u.role === 'CHAUFFEUR').length || 0,
            coursesToday: courses.length,
            revenuToday: courses.reduce((s: number, c: any) => s + (c.prix || 0), 0),
            motosActives: f.motos?.filter((m: any) => m.statut === 'ACTIF').length || 0,
          });
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  const s = stats;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-l-4 border-l-orange-500">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🏍️ {s.flotteNom || 'Ma Flotte'}</h2>
        <p className="text-gray-500 text-sm mt-1">Tableau de bord - Gérant Flotte</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Motos', value: s.totalMotos || 0, icon: Bike, color: 'bg-orange-100 text-orange-700' },
          { label: 'Actives', value: s.motosActives || 0, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
          { label: 'Chauffeurs', value: s.totalChauffeurs || 0, icon: Users, color: 'bg-blue-100 text-blue-700' },
          { label: 'Courses/jour', value: s.coursesToday || 0, icon: MapPin, color: 'bg-purple-100 text-purple-700' },
          { label: 'Revenu/jour', value: `${(s.revenuToday || 0).toLocaleString()} Ar`, icon: DollarSign, color: 'bg-amber-100 text-amber-700' },
          { label: 'Alerts', value: 0, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border text-center">
            <card.icon size={20} className={`mx-auto mb-2 ${card.color} p-1 rounded-lg`} />
            <div className="text-xl font-bold">{card.value}</div>
            <div className="text-xs text-gray-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border text-center">
        <p className="text-gray-400">🚀 Dashboard Flotte v2.0</p>
      </div>
    </div>
  );
};

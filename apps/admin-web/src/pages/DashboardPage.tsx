import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Building2, Users, Bike, TrendingUp, Clock, CheckCircle, ArrowRight, CreditCard, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const { data: flottes } = useQuery({
    queryKey: ['flottes-dash'],
    queryFn: () => axios.get(`${API}/flottes`).then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: params } = useQuery({
    queryKey: ['params-abonnement'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => r.data),
  });

  const flottesList = Array.isArray(flottes) ? flottes : [];
  const enAttente = flottesList.filter((f: any) => f.statut === 'EN_ATTENTE').length;
  const actives = flottesList.filter((f: any) => f.statut === 'ACTIF').length;

  // Paramètres d'abonnement
  const paramsMap: Record<string, string> = {};
  if (Array.isArray(params)) params.forEach((p: any) => { paramsMap[p.nom] = p.valeur; });

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">👋 Bienvenue {user?.nom}</h1>
        <p className="text-gray-500">Gérez votre flotte depuis le menu.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👑 Tableau de bord Plateforme</h1>
        <span className="text-sm text-gray-400">{new Date().toLocaleDateString('fr', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/app/flottes')} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{flottesList.length}</p><p className="text-xs text-gray-500">Flottes totales</p></div>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">{enAttente} en attente</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">{actives} actives</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3"><CheckCircle size={20} className="text-green-600" /></div>
          <p className="text-2xl font-bold">{actives}</p>
          <p className="text-xs text-gray-500">Flottes actives</p>
        </div>

        <div onClick={() => navigate('/app/abonnements')} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg transition-all">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3"><CreditCard size={20} className="text-purple-600" /></div>
          <p className="text-2xl font-bold">💰</p>
          <p className="text-xs text-gray-500">Abonnements</p>
        </div>

        <div onClick={() => navigate('/app/assistance')} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg transition-all">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-3"><Activity size={20} className="text-red-600" /></div>
          <p className="text-2xl font-bold">🔔</p>
          <p className="text-xs text-gray-500">Support</p>
        </div>
      </div>

      {/* Flottes en attente - urgent */}
      {enAttente > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-yellow-700 flex items-center gap-2"><Clock size={18} /> {enAttente} flotte(s) en attente de validation</h2>
            <button onClick={() => navigate('/app/flottes')} className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1">Voir tout <ArrowRight size={14} /></button>
          </div>
          <div className="space-y-2">
            {flottesList.filter((f: any) => f.statut === 'EN_ATTENTE').slice(0, 3).map((f: any) => (
              <div key={f.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-yellow-500" />
                  <div>
                    <p className="font-medium text-sm">{f.nom}</p>
                    <p className="text-xs text-gray-400">{f.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString('fr')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grille des tarifs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CreditCard size={18} /> Tarifs des abonnements</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Gratuit', motos: '1 moto', prix: '0 Ar', color: 'gray' },
            { label: 'Standard', motos: '2-5 motos', prix: (paramsMap['abonnement_2_5_prix_mensuel'] || '50000') + ' Ar/mois', color: 'blue' },
            { label: 'Premium', motos: '6-10 motos', prix: (paramsMap['abonnement_6_10_prix_mensuel'] || '90000') + ' Ar/mois', color: 'purple' },
            { label: 'Business', motos: '11+ motos', prix: (paramsMap['abonnement_11_plus_prix_mensuel'] || '150000') + ' Ar/mois', color: 'amber' },
          ].map((plan, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
              <p className="font-bold text-lg text-gray-900 dark:text-white">{plan.label}</p>
              <p className="text-sm text-gray-500">{plan.motos}</p>
              <p className="text-xl font-bold text-primary mt-2">{plan.prix}</p>
              <p className="text-xs text-gray-400 mt-1">-{paramsMap['reduction_annuelle_pourcent'] || '7'}% en annuel</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dernières flottes actives */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Building2 size={18} /> Flottes actives récentes</h2>
          <button onClick={() => navigate('/app/flottes')} className="text-sm text-primary hover:underline flex items-center gap-1">Gérer <ArrowRight size={14} /></button>
        </div>
        <div className="space-y-2">
          {flottesList.filter((f: any) => f.statut === 'ACTIF').slice(0, 5).map((f: any) => (
            <div key={f.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"><Building2 size={14} className="text-primary" /></div>
                <div>
                  <p className="font-medium text-sm">{f.nom}</p>
                  <p className="text-xs text-gray-400">{f._count?.motos || 0} moto(s) • {f.abonnement || 'GRATUIT'}</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">Actif</span>
            </div>
          ))}
          {flottesList.filter((f: any) => f.statut === 'ACTIF').length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Aucune flotte active</p>
          )}
        </div>
      </div>
    </div>
  );
}

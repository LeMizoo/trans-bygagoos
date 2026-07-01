import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Building2, Bike, Users, TrendingUp, Activity, ArrowRight, CreditCard, Phone, MapPin } from 'lucide-react';
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
    enabled: isSuperAdmin,
  });

  const { data: maFlotte } = useQuery({
    queryKey: ['ma-flotte', user?.flotteId],
    queryFn: () => axios.get(`${API}/flottes/${user?.flotteId}`).then(r => r.data),
    enabled: !!user?.flotteId && !isSuperAdmin,
  });

  const { data: params } = useQuery({
    queryKey: ['params-abonnement'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => r.data),
  });

  const flottesList = Array.isArray(flottes) ? flottes : [];
  const enAttente = flottesList.filter((f: any) => f.statut === 'EN_ATTENTE').length;
  const actives = flottesList.filter((f: any) => f.statut === 'ACTIF').length;

  const paramsMap: Record<string, string> = {};
  if (Array.isArray(params)) params.forEach((p: any) => { paramsMap[p.nom] = p.valeur; });

  // DASHBOARD GÉRANT
  if (!isSuperAdmin) {
    const f = maFlotte;
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👋 Bienvenue {user?.nom}</h1>
            <p className="text-gray-500">🏢 {f?.nom || 'Votre flotte'}</p>
          </div>
          <span className="text-sm text-gray-400">{new Date().toLocaleDateString('fr', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div onClick={() => navigate('/app/motos')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-lg">
            <Bike size={24} className="text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{f?._count?.motos || 0}</p>
            <p className="text-xs text-gray-500">Motos</p>
          </div>
          <div onClick={() => navigate('/app/chauffeurs')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-lg">
            <Users size={24} className="text-green-500 mb-2" />
            <p className="text-2xl font-bold">{f?._count?.chauffeurs || 0}</p>
            <p className="text-xs text-gray-500">Chauffeurs</p>
          </div>
          <div onClick={() => navigate('/app/courses')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-lg">
            <TrendingUp size={24} className="text-purple-500 mb-2" />
            <p className="text-2xl font-bold">📊</p>
            <p className="text-xs text-gray-500">Courses</p>
          </div>
          <div onClick={() => navigate('/app/depenses')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-lg">
            <Activity size={24} className="text-red-500 mb-2" />
            <p className="text-2xl font-bold">💰</p>
            <p className="text-xs text-gray-500">Dépenses</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="font-semibold text-lg mb-4">📋 Infos Flotte</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Email :</span> {f?.email || '-'}</div>
            <div><span className="text-gray-500">Téléphone :</span> {f?.telephone || '-'}</div>
            <div><span className="text-gray-500">Abonnement :</span> {f?.abonnement || 'GRATUIT'}</div>
            <div><span className="text-gray-500">Statut :</span> <span className="text-green-600 font-medium">{f?.statut}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/app/motos')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-lg text-left">
            <Bike size={24} className="text-blue-500 mb-2" />
            <p className="font-semibold">Gérer les Motos</p>
            <p className="text-xs text-gray-500 mt-1">Ajouter, modifier, assigner</p>
          </button>
          <button onClick={() => navigate('/app/chauffeurs')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-lg text-left">
            <Users size={24} className="text-green-500 mb-2" />
            <p className="font-semibold">Gérer les Chauffeurs</p>
            <p className="text-xs text-gray-500 mt-1">Ajouter, modifier, codes</p>
          </button>
          <button onClick={() => navigate('/app/courses')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-lg text-left">
            <TrendingUp size={24} className="text-purple-500 mb-2" />
            <p className="font-semibold">Voir les Courses</p>
            <p className="text-xs text-gray-500 mt-1">Suivi des courses</p>
          </button>
          <button onClick={() => navigate('/app/proprietaires')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-lg text-left">
            <Building2 size={24} className="text-primary mb-2" />
            <p className="font-semibold">Profil Flotte</p>
            <p className="text-xs text-gray-500 mt-1">Modifier les infos</p>
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD SUPER ADMIN
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👑 Tableau de bord Plateforme</h1>
        <span className="text-sm text-gray-400">{new Date().toLocaleDateString('fr', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/app/flottes')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-lg">
          <Building2 size={20} className="text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{flottesList.length}</p>
          <p className="text-xs text-gray-500">Flottes totales</p>
          <div className="flex gap-2 mt-1 text-xs">
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">{enAttente} en attente</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{actives} actives</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5"><CheckCircle2 size={20} className="text-green-600 mb-2" /><p className="text-2xl font-bold">{actives}</p><p className="text-xs text-gray-500">Actives</p></div>
        <div onClick={() => navigate('/app/abonnements')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-lg"><CreditCard size={20} className="text-purple-600 mb-2" /><p className="text-2xl font-bold">💰</p><p className="text-xs text-gray-500">Abonnements</p></div>
        <div onClick={() => navigate('/app/assistance')} className="bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-lg"><Activity size={20} className="text-red-600 mb-2" /><p className="text-2xl font-bold">🔔</p><p className="text-xs text-gray-500">Support</p></div>
      </div>

      {enAttente > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-yellow-700">⏳ {enAttente} flotte(s) en attente</h2>
            <button onClick={() => navigate('/app/flottes')} className="text-sm text-yellow-600 flex items-center gap-1">Voir tout <ArrowRight size={14} /></button>
          </div>
          {flottesList.filter((f: any) => f.statut === 'EN_ATTENTE').slice(0, 3).map((f: any) => (
            <div key={f.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-3"><Building2 size={18} className="text-yellow-500" /><div><p className="font-medium text-sm">{f.nom}</p><p className="text-xs text-gray-400">{f.email}</p></div></div>
              <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString('fr')}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
        <h2 className="font-semibold mb-4">💰 Grille tarifaire</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Gratuit', motos: '1 moto', prix: '0 Ar', color: 'gray' },
            { label: 'Standard', motos: '2-5 motos', prix: (paramsMap['abonnement_2_5_prix_mensuel'] || '50000') + ' Ar/mois', color: 'blue' },
            { label: 'Premium', motos: '6-10 motos', prix: (paramsMap['abonnement_6_10_prix_mensuel'] || '90000') + ' Ar/mois', color: 'purple' },
            { label: 'Business', motos: '11+ motos', prix: (paramsMap['abonnement_11_plus_prix_mensuel'] || '150000') + ' Ar/mois', color: 'amber' },
          ].map((plan, i) => (
            <div key={i} className="border rounded-xl p-4 text-center">
              <p className="font-bold text-lg">{plan.label}</p>
              <p className="text-sm text-gray-500">{plan.motos}</p>
              <p className="text-xl font-bold text-primary mt-2">{plan.prix}</p>
              <p className="text-xs text-gray-400 mt-1">-{paramsMap['reduction_annuelle_pourcent'] || '7'}% en annuel</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Petit composant pour éviter l'erreur
function CheckCircle2({ size, className }: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

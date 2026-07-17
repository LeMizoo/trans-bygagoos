import React, { useState, useEffect } from 'react';
import { Building2, Users, Bike, Package, TrendingUp, TrendingDown, Activity, DollarSign, ShoppingCart, Star, AlertTriangle, UserX, Clock, Wrench } from 'lucide-react';
import { api } from '../../api/client';

export const DashboardPage = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/coops'), api.get('/livreurs'), api.get('/vehicules'), api.get('/commandes'),
      api.get('/abonnements'), api.get('/parametres'),
    ]).then(([coops, livreurs, vehicules, commandes, abonnements, parametres]) => {
      const c = Array.isArray(coops.data) ? coops.data : [];
      const l = Array.isArray(livreurs.data) ? livreurs.data : [];
      const v = Array.isArray(vehicules.data) ? vehicules.data : [];
      const cmd = Array.isArray(commandes.data) ? commandes.data : [];
      const abo = Array.isArray(abonnements.data) ? abonnements.data : [];
      const flottes = c.filter(x => x.nom?.toLowerCase().includes('flotte') || x.nom?.toLowerCase().includes('taxi'));
      const coopsList = c.filter(x => !x.nom?.toLowerCase().includes('flotte') && !x.nom?.toLowerCase().includes('taxi'));
      const caTotal = cmd.reduce((s: number, x: any) => s + (x.prix || 0), 0);
      const livreursSansVehicule = l.filter(x => !x.vehicule);
      const vehiculesDispo = v.filter(x => x.statut === 'DISPONIBLE');
      const abosActifs = abo.filter(x => x.statut === 'ACTIF');
      const commandesEnCours = cmd.filter(x => x.statut === 'EN_COURS' || x.statut === 'EN_ATTENTE');
      setStats({
        flottes: flottes.length, coops: coopsList.length, totalEntites: c.length,
        livreurs: l.length, livreursActifs: l.filter(x => x.actif).length, livreursSansVehicule: livreursSansVehicule.length,
        vehicules: v.length, vehiculesDispo: vehiculesDispo.length, vehiculesEnCourse: v.length - vehiculesDispo.length,
        commandes: cmd.length, commandesEnCours: commandesEnCours.length, commandesLivrees: cmd.filter(x => x.statut === 'LIVREE').length,
        caTotal, abosActifs: abosActifs.length, abosInactifs: abo.length - abosActifs.length,
        topLivreurs: [...l].sort((a,b) => (b.solde||0) - (a.solde||0)).slice(0,5),
        topVehicules: [...v].sort((a,b) => (b.kilometrage||0) - (a.kilometrage||0)).slice(0,5),
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-l-4 border-l-indigo-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Tableau de bord</h2>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble · {new Date().toLocaleDateString('fr', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-bold">{stats.abosActifs} abonnements actifs</span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-bold">{stats.livreursActifs} livreurs actifs</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Coopératives', value: stats.totalEntites, sub: `${stats.flottes} flottes · ${stats.coops} coops`, icon: Building2, color: 'from-indigo-500 to-blue-600' },
          { label: 'Livreurs actifs', value: stats.livreursActifs, sub: `${stats.livreursSansVehicule} sans véhicule`, icon: Users, color: 'from-green-500 to-emerald-600' },
          { label: 'Véhicules dispos', value: stats.vehiculesDispo, sub: `${stats.vehiculesEnCourse} en course`, icon: Bike, color: 'from-orange-500 to-amber-600' },
          { label: 'CA total', value: `${(stats.caTotal||0).toLocaleString()} Ar`, sub: `${stats.commandesLivrees} commandes livrées`, icon: DollarSign, color: 'from-purple-500 to-pink-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`bg-gradient-to-br ${card.color} w-11 h-11 rounded-xl flex items-center justify-center shadow-lg`}><card.icon size={22} className="text-white" /></div>
            </div>
            <div className="text-3xl font-extrabold mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-500">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Deuxième ligne KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Commandes en cours', value: stats.commandesEnCours, icon: Package, color: 'bg-yellow-100 text-yellow-700', sub: 'À traiter' },
          { label: 'Abonnements actifs', value: stats.abosActifs, icon: Star, color: 'bg-indigo-100 text-indigo-700', sub: `${stats.abosInactifs} inactifs` },
          { label: 'Livreurs sans véhicule', value: stats.livreursSansVehicule, icon: UserX, color: stats.livreursSansVehicule > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700', sub: stats.livreursSansVehicule > 0 ? '⚠️ À assigner' : '✅ Tous assignés' },
          { label: 'Taux disponibilité', value: `${stats.vehicules ? Math.round((stats.vehiculesDispo/stats.vehicules)*100) : 0}%`, icon: Activity, color: 'bg-green-100 text-green-700', sub: 'Véhicules disponibles' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}><card.icon size={20} /></div>
            <div className="text-2xl font-extrabold mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-500">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Top livreurs + Top véhicules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">⭐ Top 5 livreurs (solde)</h3>
          <div className="space-y-3">
            {stats.topLivreurs?.map((l: any, i: number) => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-xs font-bold">{i+1}</span>
                  <div><div className="font-bold text-sm">{l.nom}</div><div className="text-xs text-gray-400">{l.coop?.nom}</div></div>
                </div>
                <span className="font-bold text-sm">{(l.solde||0).toLocaleString()} Ar</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🏍️ Top 5 véhicules (kilométrage)</h3>
          <div className="space-y-3">
            {stats.topVehicules?.map((v: any, i: number) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center text-xs font-bold">{i+1}</span>
                  <div><div className="font-bold text-sm font-mono">{v.immatriculation}</div><div className="text-xs text-gray-400">{v.modele}</div></div>
                </div>
                <span className="font-bold text-sm">{(v.kilometrage||0).toLocaleString()} km</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphiques simples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📈 Répartition flottes / coops</h3>
          <div className="space-y-4">
            {[
              { label: '🏍️ Flottes', value: stats.flottes||0, color: 'bg-orange-500', total: stats.totalEntites||1 },
              { label: '📦 Coops', value: stats.coops||0, color: 'bg-green-500', total: stats.totalEntites||1 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2"><span>{item.label}</span><span className="font-bold">{item.value}</span></div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3"><div className={`${item.color} h-3 rounded-full`} style={{width:`${Math.round((item.value/item.total)*100)}%`}} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📊 Commandes</h3>
          <div className="space-y-4">
            {[
              { label: 'Livrées', value: stats.commandesLivrees||0, color: 'bg-green-500', total: stats.commandes||1 },
              { label: 'En cours', value: stats.commandesEnCours||0, color: 'bg-orange-500', total: stats.commandes||1 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2"><span>{item.label}</span><span className="font-bold">{item.value}</span></div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3"><div className={`${item.color} h-3 rounded-full`} style={{width:`${Math.round((item.value/item.total)*100)}%`}} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

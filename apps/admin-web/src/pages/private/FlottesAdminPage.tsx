import React, { useState, useEffect } from 'react';
import { Building2, Users, Bike, Phone, MapPin, Search, Plus, Mail, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';

export const FlottesAdminPage = () => {
  const [flottes, setFlottes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFlotte, setSelectedFlotte] = useState<any>(null);

  useEffect(() => {
    api.get('/flottes').then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setFlottes(data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = flottes.filter(f => 
    f.nom?.toLowerCase().includes(search.toLowerCase()) ||
    f.code?.toLowerCase().includes(search.toLowerCase()) ||
    f.adresse?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMotos = flottes.reduce((sum, f) => sum + (f._count?.motos || 0), 0);
  const totalChauffeurs = flottes.reduce((sum, f) => sum + (f._count?.users || 0), 0);
  const actives = flottes.filter(f => f.statut === 'ACTIF').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">🏍️ Flottes</h2>
          <p className="text-gray-500 mt-1">Gestion des flottes de taxi-motos</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-56"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus size={18} /> Nouvelle
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Flottes', value: flottes.length, icon: Building2, color: 'bg-indigo-100 text-indigo-700' },
          { label: 'Actives', value: actives, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
          { label: 'Chauffeurs', value: totalChauffeurs, icon: Users, color: 'bg-orange-100 text-orange-700' },
          { label: 'Motos', value: totalMotos, icon: Bike, color: 'bg-blue-100 text-blue-700' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border text-center">
            <stat.icon size={20} className={`mx-auto mb-1 ${stat.color} p-1 rounded-lg`} />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Liste des flottes */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">Aucune flotte trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(flotte => (
            <div 
              key={flotte.id} 
              onClick={() => setSelectedFlotte(selectedFlotte?.id === flotte.id ? null : flotte)}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer card-hover ${
                selectedFlotte?.id === flotte.id ? 'ring-2 ring-indigo-500 shadow-lg' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Building2 size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  flotte.statut === 'ACTIF' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {flotte.statut === 'ACTIF' ? '✅ Actif' : '❌ Inactif'}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{flotte.nom}</h3>
              <p className="text-xs text-indigo-500 font-mono mb-3">#{flotte.code}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="flex-shrink-0" /> 
                  <span className="truncate">{flotte.adresse || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="flex-shrink-0" /> {flotte.telephone || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="flex-shrink-0" /> 
                  <span className="truncate text-xs">{flotte.email || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users size={12} /> {flotte._count?.users || 0}</span>
                  <span className="flex items-center gap-1"><Bike size={12} /> {flotte._count?.motos || 0}</span>
                </div>
                <ChevronRight size={16} className={`text-gray-400 transition-transform ${selectedFlotte?.id === flotte.id ? 'rotate-90' : ''}`} />
              </div>

              {/* Détails étendus */}
              {selectedFlotte?.id === flotte.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3 animate-fade-in-up">
                  <h4 className="font-bold text-sm">👤 Membres ({flotte.users?.length || 0})</h4>
                  {flotte.users?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {flotte.users.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <span className="font-medium">{u.nom} {u.prenom}</span>
                            <span className="text-gray-400 ml-2">{u.role}</span>
                          </div>
                          <span className="text-gray-400">{u.email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Aucun membre</p>
                  )}
                  
                  <h4 className="font-bold text-sm">🏍️ Motos ({flotte.motos?.length || 0})</h4>
                  {flotte.motos?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {flotte.motos.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <span className="font-medium">{m.marque} {m.modele}</span>
                          <span className="text-gray-400 font-mono">{m.immatriculation}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Aucune moto</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

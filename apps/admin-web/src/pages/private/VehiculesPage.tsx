import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Bike, Car, Truck, Gauge, User, Edit3, ArrowUpDown } from 'lucide-react';
import { api } from '../../api/client';

const config: any = {
  MOTO: { icon: Bike, emoji: '🏍️' }, VOITURE: { icon: Car, emoji: '🚗' }, CAMIONNETTE: { icon: Truck, emoji: '🚛' },
};

export const VehiculesPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [vehicules, setVehicules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchVehicules = () => {
    api.get('/vehicules').then(res => {
      let data = Array.isArray(res.data) ? res.data : [];
      if (type === 'FLOTTE') data = data.filter((v: any) => v.coop?.nom?.toLowerCase().includes('flotte') || v.coop?.nom?.toLowerCase().includes('taxi'));
      else if (type === 'COOP') data = data.filter((v: any) => !v.coop?.nom?.toLowerCase().includes('flotte') && !v.coop?.nom?.toLowerCase().includes('taxi'));
      setVehicules(data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicules(); }, [type]);

  const changeStatut = async (v: any) => {
    const newStatut = v.statut === 'DISPONIBLE' ? 'EN_COURSE' : 'DISPONIBLE';
    try { await api.put(`/vehicules/${v.id}`, { statut: newStatut }); fetchVehicules(); } catch { alert('Erreur'); }
  };

  const editVehicule = (v: any) => {
    const km = prompt('Kilométrage:', v.kilometrage);
    if (km) api.put(`/vehicules/${v.id}`, { kilometrage: parseInt(km) }).then(fetchVehicules).catch(() => alert('Erreur'));
  };

  const filtered = vehicules.filter(v => v.immatriculation?.toLowerCase().includes(search.toLowerCase()) || v.modele?.toLowerCase().includes(search.toLowerCase()));
  const title = type === 'FLOTTE' ? '🏍️ Motos Flotte' : type === 'COOP' ? '🚛 Véhicules Coop' : '🏍️ Tous les véhicules';

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div><h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2><p className="text-gray-500 mt-1">{filtered.length} véhicule(s)</p></div>
        <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl text-sm w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(v => {
          const cfg = config[v.type] || config.MOTO;
          const Icon = cfg.icon;
          return (
            <div key={v.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 w-14 h-14 rounded-xl flex items-center justify-center"><Icon size={28} /></div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${v.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' : v.statut === 'EN_COURSE' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{v.statut}</span>
              </div>
              <h3 className="text-xl font-bold font-mono mb-1">{v.immatriculation}</h3>
              <p className="text-gray-500 text-sm mb-4">{cfg.emoji} {v.modele}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg"><Gauge size={14} /> {v.kilometrage || 0} km</span>
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg"><User size={14} /> {v.livreur?.nom || 'Libre'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => changeStatut(v)} className="flex-1 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"><ArrowUpDown size={14} className="inline mr-1" /> Changer statut</button>
                <button onClick={() => editVehicule(v)} className="flex-1 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors"><Edit3 size={14} className="inline mr-1" /> Modifier</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

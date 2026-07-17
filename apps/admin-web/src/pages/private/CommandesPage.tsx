import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, Truck, MapPin, User, DollarSign, Calendar, X, Eye } from 'lucide-react';
import { api } from '../../api/client';

const statutSteps = ['EN_ATTENTE', 'EN_COURS', 'LIVREE'];
const statutConfig: any = {
  EN_ATTENTE: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', step: 0 },
  EN_COURS: { icon: Truck, color: 'bg-blue-100 text-blue-700', step: 1 },
  LIVREE: { icon: CheckCircle, color: 'bg-green-100 text-green-700', step: 2 },
};

export const CommandesPage = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    api.get('/commandes').then(res => setCommandes(Array.isArray(res.data) ? res.data : [])).finally(() => setLoading(false));
  }, []);

  const avancerStatut = (c: any) => {
    const idx = statutSteps.indexOf(c.statut);
    if (idx < statutSteps.length - 1) {
      setCommandes(prev => prev.map(x => x.id === c.id ? {...x, statut: statutSteps[idx+1]} : x));
    }
  };

  const filtered = commandes.filter(c => (c.client||'').toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div><h2 className="text-3xl font-bold text-gray-900 dark:text-white">Suivi des commandes</h2><p className="text-gray-500 mt-1">{filtered.length} commande(s)</p></div>
        <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client..." className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl text-sm w-64" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(c => {
          const st = statutConfig[c.statut] || statutConfig.EN_ATTENTE;
          const StatusIcon = st.icon;
          return (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${st.color} flex items-center justify-center`}><StatusIcon size={20} /></div>
                  <div><div className="font-bold font-mono text-sm">#{c.id?.slice(-8)}</div><div className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} /> {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr') : '-'}</div></div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${st.color}`}>{st.label}</span>
              </div>
              <div className="flex items-center gap-2 mb-4 px-2">
                {statutSteps.map((step, i) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`w-3 h-3 rounded-full ${i <= st.step ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {i < statutSteps.length - 1 && <div className={`flex-1 h-0.5 ${i < st.step ? 'bg-green-500' : 'bg-gray-300'}`} />}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-3 gap-3 text-sm flex-1">
                  <div className="flex items-center gap-2 text-gray-500"><User size={15} /> <span className="font-medium">{c.client || '-'}</span></div>
                  <div className="flex items-center gap-2 text-gray-500"><MapPin size={15} /> {c.adresse || '-'}</div>
                  <div className="flex items-center gap-2 text-gray-500"><DollarSign size={15} /> <span className="font-bold">{(c.prix||0).toLocaleString()} Ar</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDetail(c)} className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600" title="Details"><Eye size={16} /></button>
                  {c.statut !== 'LIVREE' && (
                    <button onClick={() => avancerStatut(c)} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200">
                      Avancer →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODALE DETAIL */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Commande #{detail.id?.slice(-8)}</h3>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-gray-500">Client</span><span className="font-bold">{detail.client || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Adresse</span><span>{detail.adresse || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Montant</span><span className="font-bold text-lg">{(detail.prix||0).toLocaleString()} Ar</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Statut</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${(statutConfig[detail.statut]||statutConfig.EN_ATTENTE).color}`}>{(statutConfig[detail.statut]||statutConfig.EN_ATTENTE).label}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{detail.createdAt ? new Date(detail.createdAt).toLocaleString('fr') : '-'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Calendar, Edit3, Bell, X, Search, DollarSign, Building2 } from 'lucide-react';
import { api } from '../../api/client';

export const AbonnementsPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('TOUS');
  const [modal, setModal] = useState<any>(null);
  const [modalData, setModalData] = useState<any>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/abonnements').then(res => {
      let data = Array.isArray(res.data) ? res.data : [];
      if (type !== 'TOUS') data = data.filter((a: any) => a.type === type);
      setAbonnements(data);
    }).finally(() => setLoading(false));
  }, [type]);

  const openModal = (a: any) => { setModal(a); setModalData({ ...a }); };
  const closeModal = () => { setModal(null); setModalData({}); };
  
  const saveModal = () => {
    api.put(`/abonnements/${modal.id}`, modalData).then(() => {
      setAbonnements(prev => prev.map(a => a.id === modal.id ? { ...a, ...modalData } : a));
      setMsg('✅ Abonnement mis à jour');
      setTimeout(() => setMsg(''), 3000);
      closeModal();
    }).catch(() => {
      setMsg('❌ Erreur lors de la sauvegarde');
      setTimeout(() => setMsg(''), 3000);
    });
  };

  const toggleStatut = (a: any) => {
    const newStatut = a.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    api.put(`/abonnements/${a.id}`, { statut: newStatut }).then(() => {
      setAbonnements(prev => prev.map(x => x.id === a.id ? { ...x, statut: newStatut } : x));
      setMsg(`✅ Statut changé en ${newStatut}`);
      setTimeout(() => setMsg(''), 2000);
    }).catch(() => {
      setMsg('❌ Erreur lors du changement de statut');
      setTimeout(() => setMsg(''), 2000);
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = abonnements.filter(a => {
    const matchSearch = (a.nom || a.type || '').toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'TOUS' || a.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const totalActifs = filtered.filter(a => a.statut === 'ACTIF').length;
  const revenuMensuel = filtered.filter(a => a.statut === 'ACTIF').reduce((sum, a) => sum + (a.prix || 0), 0);

  const title = type === 'FLOTTE' ? '🏍️ Abonnements Flottes' : type === 'COOP' ? '📦 Abonnements Coops' : '💳 Tous les abonnements';
  const tabs = [
    { key: 'TOUS', label: '📋 Tous' },
    { key: 'FLOTTE', label: '🏍️ Flottes' },
    { key: 'COOP', label: '📦 Coops' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-500 mt-1">{filtered.length} abonnement(s) · {totalActifs} actif(s) · {revenuMensuel.toLocaleString()} Ar/mois</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." 
              className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-48" />
          </div>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} 
            className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm">
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">✅ Actifs</option>
            <option value="INACTIF">❌ Inactifs</option>
          </select>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium animate-fade-in-up ${msg.startsWith('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
          {msg}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <a key={tab.key} href={`/abonnements?type=${tab.key}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${type === tab.key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 border hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {tab.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: filtered.length, icon: CreditCard, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
          { label: 'Actifs', value: totalActifs, icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
          { label: 'Revenu/mois', value: `${revenuMensuel.toLocaleString()} Ar`, icon: DollarSign, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
          { label: 'Inactifs', value: filtered.length - totalActifs, icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border text-center">
            <stat.icon size={20} className={`mx-auto mb-1 ${stat.color} p-1 rounded-lg`} />
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-4 px-6 font-semibold text-sm">Client</th>
                <th className="text-center py-4 px-6 font-semibold text-sm">Type</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Formule</th>
                <th className="text-right py-4 px-6 font-semibold text-sm">Prix/mois</th>
                <th className="text-center py-4 px-6 font-semibold text-sm">Statut</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Échéance</th>
                <th className="text-center py-4 px-6 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
                    Aucun abonnement trouvé
                  </td>
                </tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className={a.type === 'FLOTTE' ? 'text-orange-500' : 'text-green-500'} />
                        <span className="font-bold">{a.nom || 'Client sans nom'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${a.type === 'FLOTTE' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {a.type === 'FLOTTE' ? '🏍️ Flotte' : '📦 Coop'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium px-2 py-1 rounded-lg text-xs ${a.formule === 'Premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : a.formule === 'Standard' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {a.formule || 'Basic'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-green-600 dark:text-green-400">{(a.prix || 0).toLocaleString()} Ar</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => toggleStatut(a)} 
                        className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity ${a.statut === 'ACTIF' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {a.statut === 'ACTIF' ? '✅ Actif' : '❌ Inactif'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} className="inline mr-1" />{formatDate(a.fin)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(a)} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400" title="Modifier">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => { setMsg(`📧 Notification envoyée à ${a.nom || 'ce client'} !`); setTimeout(() => setMsg(''), 3000); }} 
                          className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400" title="Notifier">
                          <Bell size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">✏️ Modifier l'abonnement</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nom du client</label>
                <input value={modalData.nom || ''} onChange={e => setModalData({...modalData, nom: e.target.value})} 
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Formule</label>
                <select value={modalData.formule || 'Basic'} onChange={e => setModalData({...modalData, formule: e.target.value})} 
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600">
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Prix/mois (Ar)</label>
                <input type="number" value={modalData.prix || ''} onChange={e => setModalData({...modalData, prix: parseInt(e.target.value) || 0})} 
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Échéance</label>
                <input type="date" value={modalData.fin ? new Date(modalData.fin).toISOString().split('T')[0] : ''} 
                  onChange={e => setModalData({...modalData, fin: new Date(e.target.value).toISOString()})} 
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Annuler</button>
              <button onClick={saveModal} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">💾 Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

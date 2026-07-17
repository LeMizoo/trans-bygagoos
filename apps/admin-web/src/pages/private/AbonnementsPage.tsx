import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Calendar, Edit3, Bell, X } from 'lucide-react';
import { api } from '../../api/client';

export const AbonnementsPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'TOUS';
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('nom');
  const [filterStatut, setFilterStatut] = useState('TOUS');
  const [modal, setModal] = useState<any>(null);
  const [modalData, setModalData] = useState<any>({});

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
    setAbonnements(prev => prev.map(a => a.id === modal.id ? { ...a, ...modalData } : a));
    closeModal();
  };

  const toggleStatut = (a: any) => {
    setAbonnements(prev => prev.map(x => x.id === a.id ? { ...x, statut: x.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF' } : x));
  };

  const notify = (a: any) => alert(`Notification envoyee a ${a.nom}`);

  const filtered = abonnements
    .filter(a => filterStatut === 'TOUS' || a.statut === filterStatut)
    .sort((a, b) => sort === 'prix' ? (b.prix||0) - (a.prix||0) : sort === 'fin' ? (a.fin||'').localeCompare(b.fin||'') : (a.nom||'').localeCompare(b.nom||''));

  const title = type === 'FLOTTE' ? 'Abonnements Flottes' : type === 'COOP' ? 'Abonnements Coops' : 'Tous les abonnements';

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div><h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2><p className="text-gray-500 mt-1">{filtered.length} abonnement(s)</p></div>
        <div className="flex gap-2">
          <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-xl text-sm">
            <option value="nom">Nom</option><option value="prix">Prix</option><option value="fin">Echeance</option>
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-xl text-sm">
            <option value="TOUS">Tous</option><option value="ACTIF">Actifs</option><option value="INACTIF">Inactifs</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border">
        <table className="w-full">
          <thead><tr className="border-b bg-gray-50 dark:bg-gray-900/50"><th className="text-left py-4 px-6 font-semibold text-sm">Client</th><th className="text-left py-4 px-6 font-semibold text-sm">Formule</th><th className="text-right py-4 px-6 font-semibold text-sm">Prix/mois</th><th className="text-center py-4 px-6 font-semibold text-sm">Statut</th><th className="text-left py-4 px-6 font-semibold text-sm">Echeance</th><th className="text-center py-4 px-6 font-semibold text-sm">Actions</th></tr></thead>
          <tbody className="divide-y">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-4 px-6 font-bold">{a.nom}</td>
                <td className="py-4 px-6">{a.formule}</td>
                <td className="py-4 px-6 text-right font-bold">{a.prix?.toLocaleString?.() ?? a.prix} Ar</td>
                <td className="py-4 px-6 text-center">
                  <button onClick={() => toggleStatut(a)} className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 ${a.statut==='ACTIF'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{a.statut}</button>
                </td>
                <td className="py-4 px-6 text-sm text-gray-500"><Calendar size={14} className="inline mr-1" />{a.fin}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openModal(a)} className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600" title="Modifier"><Edit3 size={16} /></button>
                    <button onClick={() => notify(a)} className="p-2 hover:bg-amber-100 rounded-lg text-amber-600" title="Notifier"><Bell size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Modifier {modal.nom}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold mb-1">Nom</label><input value={modalData.nom||''} onChange={e => setModalData({...modalData, nom: e.target.value})} className="w-full p-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-1">Formule</label><select value={modalData.formule||''} onChange={e => setModalData({...modalData, formule: e.target.value})} className="w-full p-3 border rounded-xl"><option>Basic</option><option>Standard</option><option>Premium</option></select></div>
              <div><label className="block text-sm font-semibold mb-1">Prix/mois (Ar)</label><input type="number" value={modalData.prix||''} onChange={e => setModalData({...modalData, prix: parseInt(e.target.value)})} className="w-full p-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-1">Echeance</label><input value={modalData.fin||''} onChange={e => setModalData({...modalData, fin: e.target.value})} className="w-full p-3 border rounded-xl" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-3 bg-gray-200 rounded-xl font-medium">Annuler</button>
              <button onClick={saveModal} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, AlertCircle, DollarSign, X, User, Calendar, CreditCard } from 'lucide-react';
import { api } from '../../api/client';

interface Versement {
  id: string;
  date: string;
  chauffeur: string;
  telephone: string;
  montantDu: number;
  montantVerse: number;
  resteAPayer: number;
  statut: 'paye' | 'partiel' | 'en_attente';
  modePaiement?: string;
  reference?: string;
}

const statutConfig = {
  paye: { icon: CheckCircle, label: 'Payé', color: 'bg-green-100 text-green-700', badge: 'badge-success' },
  partiel: { icon: AlertCircle, label: 'Partiel', color: 'bg-orange-100 text-orange-700', badge: 'badge-warning' },
  en_attente: { icon: Clock, label: 'En attente', color: 'bg-red-100 text-red-700', badge: 'badge-danger' },
};

export const VersementsPage = () => {
  const [versements, setVersements] = useState<Versement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState('en_attente');
  const [modal, setModal] = useState<Versement | null>(null);
  const [montantEncaisser, setMontantEncaisser] = useState(0);
  const [modePaiement, setModePaiement] = useState('especes');
  const [reference, setReference] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Simuler des données (à remplacer par API réelle)
    const data: Versement[] = [
      { id: '1', date: '2026-07-17', chauffeur: 'Koto Be', telephone: '034 00 000 01', montantDu: 50000, montantVerse: 30000, resteAPayer: 20000, statut: 'partiel' },
      { id: '2', date: '2026-07-17', chauffeur: 'Doda Tsiry', telephone: '034 00 000 02', montantDu: 45000, montantVerse: 0, resteAPayer: 45000, statut: 'en_attente' },
      { id: '3', date: '2026-07-16', chauffeur: 'Jean Rakoto', telephone: '034 00 000 03', montantDu: 60000, montantVerse: 60000, resteAPayer: 0, statut: 'paye', modePaiement: 'mobile_money', reference: 'MVola-12345' },
      { id: '4', date: '2026-07-16', chauffeur: 'Marie Rasoa', telephone: '034 00 000 04', montantDu: 35000, montantVerse: 15000, resteAPayer: 20000, statut: 'partiel' },
      { id: '5', date: '2026-07-15', chauffeur: 'Lala Nomena', telephone: '034 00 000 05', montantDu: 55000, montantVerse: 0, resteAPayer: 55000, statut: 'en_attente' },
    ];
    setVersements(data);
    setLoading(false);
  }, []);

  const filtered = versements
    .filter(v => filtre === 'tous' || v.statut === filtre)
    .filter(v => v.chauffeur.toLowerCase().includes(search.toLowerCase()));

  const totalDu = filtered.reduce((s, v) => s + v.montantDu, 0);
  const totalVerse = filtered.reduce((s, v) => s + v.montantVerse, 0);
  const totalReste = filtered.reduce((s, v) => s + v.resteAPayer, 0);

  const ouvrirEncaissement = (v: Versement) => {
    setModal(v);
    setMontantEncaisser(v.resteAPayer);
    setModePaiement('especes');
    setReference('');
  };

  const encaisser = () => {
    if (!modal || montantEncaisser <= 0) return;
    setVersements(prev => prev.map(v => {
      if (v.id === modal.id) {
        const nouveauVerse = v.montantVerse + montantEncaisser;
        const nouveauReste = Math.max(0, v.montantDu - nouveauVerse);
        return {
          ...v,
          montantVerse: nouveauVerse,
          resteAPayer: nouveauReste,
          statut: nouveauReste <= 0 ? 'paye' : 'partiel',
          modePaiement,
          reference,
        };
      }
      return v;
    }));
    setMsg(`✅ Paiement de ${montantEncaisser.toLocaleString()} Ar enregistré`);
    setModal(null);
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">💰 Versements</h2>
          <p className="text-gray-500 mt-1">Gestion des versements journaliers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFiltre('en_attente')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filtre === 'en_attente' ? 'bg-red-100 text-red-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>⏳ En attente</button>
          <button onClick={() => setFiltre('partiel')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filtre === 'partiel' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>⚠️ Partiel</button>
          <button onClick={() => setFiltre('tous')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filtre === 'tous' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>📋 Tous</button>
        </div>
      </div>

      {msg && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl text-sm font-medium">{msg}</div>}

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total dû', value: `${totalDu.toLocaleString()} Ar`, color: 'text-red-600' },
          { label: 'Total versé', value: `${totalVerse.toLocaleString()} Ar`, color: 'text-green-600' },
          { label: 'Reste à payer', value: `${totalReste.toLocaleString()} Ar`, color: 'text-orange-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un chauffeur..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-4 px-6 font-semibold text-sm">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Chauffeur</th>
                <th className="text-right py-4 px-6 font-semibold text-sm">Montant dû</th>
                <th className="text-right py-4 px-6 font-semibold text-sm">Versé</th>
                <th className="text-right py-4 px-6 font-semibold text-sm">Reste</th>
                <th className="text-center py-4 px-6 font-semibold text-sm">Statut</th>
                <th className="text-center py-4 px-6 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(v => {
                const st = statutConfig[v.statut];
                const Icon = st.icon;
                return (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 text-sm">{new Date(v.date).toLocaleDateString('fr')}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold">{v.chauffeur}</div>
                      <div className="text-xs text-gray-400">{v.telephone}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold">{v.montantDu.toLocaleString()} Ar</td>
                    <td className="py-4 px-6 text-right">{v.montantVerse.toLocaleString()} Ar</td>
                    <td className="py-4 px-6 text-right font-bold text-orange-600">{v.resteAPayer.toLocaleString()} Ar</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${st.color}`}><Icon size={14} />{st.label}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {v.statut !== 'paye' ? (
                        <button onClick={() => ouvrirEncaissement(v)} className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                          <DollarSign size={14} className="inline mr-1" /> Encaisser
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Finalisé</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE ENCAISSEMENT */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">💵 Encaisser un paiement</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-sm"><User size={16} /> <span className="font-bold">{modal.chauffeur}</span></div>
                <div className="flex items-center gap-2 text-sm mt-1"><DollarSign size={16} /> Reste à payer : <span className="font-bold text-orange-600">{modal.resteAPayer.toLocaleString()} Ar</span></div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Montant à encaisser (Ar)</label>
                <input type="number" value={montantEncaisser} onChange={e => setMontantEncaisser(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border rounded-xl text-lg font-bold" min={0} max={modal.resteAPayer} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Mode de paiement</label>
                <select value={modePaiement} onChange={e => setModePaiement(e.target.value)} className="w-full p-3 border rounded-xl">
                  <option value="especes">💰 Espèces</option>
                  <option value="mobile_money">📱 Mobile Money</option>
                  <option value="virement">🏦 Virement</option>
                  <option value="cheque">📄 Chèque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Référence (optionnel)</label>
                <input value={reference} onChange={e => setReference(e.target.value)} placeholder="N° transaction..." className="w-full p-3 border rounded-xl" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-medium">Annuler</button>
              <button onClick={encaisser} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600">✅ Encaisser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

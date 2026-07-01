import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Building2, CheckCircle, XCircle, Clock, Phone, Mail, Calendar, Edit, Save, Trash2, X, Eye, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function FlottesAdminPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['flottes-admin'],
    queryFn: () => axios.get(`${API}/flottes`).then(r => r.data),
    refetchInterval: 15000,
  });

  const validerFlotte = useMutation({
    mutationFn: (id: string) => axios.post(`${API}/flottes/${id}/valider`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flottes-admin'] }),
  });

  const rejeterFlotte = useMutation({
    mutationFn: (id: string) => axios.post(`${API}/flottes/${id}/rejeter`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flottes-admin'] }),
  });

  const deleteFlotte = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/flottes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flottes-admin'] }),
  });

  const saveEdit = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => axios.put(`${API}/flottes/${id}`, data),
    onSuccess: () => { setEditing(null); qc.invalidateQueries({ queryKey: ['flottes-admin'] }); },
  });

  const reevaluer = useMutation({
    mutationFn: (id: string) => axios.post(`${API}/flottes/${id}/reevaluer`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flottes-admin'] }),
  });

  const flottes = Array.isArray(data) ? data : [];
  const enAttente = flottes.filter((f: any) => f.statut === 'EN_ATTENTE');
  const actives = flottes.filter((f: any) => f.statut === 'ACTIF');

  const startEdit = (f: any) => {
    setEditing(f.id);
    setEditForm({ nom: f.nom, email: f.email, telephone: f.telephone, abonnement: f.abonnement, description: f.description });
  };

  const statutBadge = (statut: string) => {
    switch (statut) {
      case 'ACTIF': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle size={12} className="inline mr-1" />Actif</span>;
      case 'EN_ATTENTE': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"><Clock size={12} className="inline mr-1" />En attente</span>;
      case 'REJETE': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"><XCircle size={12} className="inline mr-1" />Rejeté</span>;
      default: return statut;
    }
  };

  const abonnementLabel = (abo: string) => {
    switch (abo) {
      case 'GRATUIT': return '🆓 Gratuit (1 moto)';
      case '2_5': return '🥈 2-5 motos';
      case '6_10': return '🥇 6-10 motos';
      case '11_PLUS': return '💎 11+ motos';
      default: return abo;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏢 Gestion des Flottes</h1>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1"><Clock size={14} className="text-yellow-500" /> {enAttente.length} en attente</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> {actives.length} actives</span>
        </div>
      </div>

      {enAttente.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-yellow-600 mb-4">⏳ En attente de validation</h2>
          <div className="grid gap-4">
            {enAttente.map((f: any) => (
              <FlotteCard key={f.id} f={f} editing={editing} editForm={editForm} setEditForm={setEditForm}
                startEdit={startEdit} saveEdit={saveEdit} validerFlotte={validerFlotte} rejeterFlotte={rejeterFlotte}
                deleteFlotte={deleteFlotte} reevaluer={reevaluer} statutBadge={statutBadge} abonnementLabel={abonnementLabel} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-green-600 mb-4">✅ Flottes actives ({actives.length})</h2>
        <div className="grid gap-4">
          {actives.map((f: any) => (
            <FlotteCard key={f.id} f={f} editing={editing} editForm={editForm} setEditForm={setEditForm}
              startEdit={startEdit} saveEdit={saveEdit} validerFlotte={validerFlotte} rejeterFlotte={rejeterFlotte}
              deleteFlotte={deleteFlotte} reevaluer={reevaluer} statutBadge={statutBadge} abonnementLabel={abonnementLabel} />
          ))}
          {actives.length === 0 && !isLoading && <p className="text-gray-500 text-center py-8">Aucune flotte active.</p>}
        </div>
      </div>
    </div>
  );
}

function FlotteCard({ f, editing, editForm, setEditForm, startEdit, saveEdit, validerFlotte, rejeterFlotte, deleteFlotte, reevaluer, statutBadge, abonnementLabel }: any) {
  const isEditing = editing === f.id;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border p-5 ${f.statut === 'EN_ATTENTE' ? 'border-yellow-200 dark:border-yellow-800' : 'border-gray-200 dark:border-gray-700'}`}>
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={editForm.nom} onChange={e => setEditForm({...editForm, nom: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm" placeholder="Nom" />
            <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm" placeholder="Email" />
            <input value={editForm.telephone} onChange={e => setEditForm({...editForm, telephone: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm" placeholder="Téléphone" />
            <select value={editForm.abonnement} onChange={e => setEditForm({...editForm, abonnement: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm">
              <option value="GRATUIT">🆓 Gratuit (1 moto)</option>
              <option value="2_5">🥈 2-5 motos</option>
              <option value="6_10">🥇 6-10 motos</option>
              <option value="11_PLUS">💎 11+ motos</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveEdit.mutate({ id: f.id, data: editForm })} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm"><Save size={14} className="inline mr-1" />Enregistrer</button>
            <button onClick={() => startEdit(null)} className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg text-sm"><X size={14} className="inline mr-1" />Annuler</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              {f.logo ? <img src={f.logo} alt="" className="w-8 h-8 object-contain" /> : <Building2 size={24} className="text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{f.nom}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                <span><Mail size={12} className="inline" /> {f.email || '-'}</span>
                <span><Phone size={12} className="inline" /> {f.telephone || '-'}</span>
                <span>🏍️ {f._count?.motos || 0} moto(s)</span>
                <span>👨‍🔧 {f._count?.chauffeurs || 0} chauffeur(s)</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {statutBadge(f.statut)}
                <span className="text-xs text-gray-400">{abonnementLabel(f.abonnement)}</span>
                {f.dateFinAbonnement && <span className="text-xs text-gray-400">Fin: {new Date(f.dateFinAbonnement).toLocaleDateString('fr')}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0 ml-2">
            <button onClick={() => window.open(`/app/proprietaires?id=${f.id}`, '_blank')} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600" title="Voir profil"><Eye size={14} /></button>
            <button onClick={() => reevaluer.mutate(f.id)} className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200" title="Réévaluer abonnement"><RefreshCw size={14} /></button>
            <button onClick={() => startEdit(f)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Modifier"><Edit size={14} /></button>
            {f.statut === 'EN_ATTENTE' && (
              <>
                <button onClick={() => validerFlotte.mutate(f.id)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200" title="Valider"><CheckCircle size={14} /></button>
                <button onClick={() => rejeterFlotte.mutate(f.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Rejeter"><XCircle size={14} /></button>
              </>
            )}
            <button onClick={() => { if (confirm('Supprimer cette flotte ?')) deleteFlotte.mutate(f.id); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Supprimer"><Trash2 size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, Edit, Trash2, User, Phone, Mail, Bike, X, Save } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function ProprietairesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', cin: '', adresse: '', nif: '', numStat: '', actif: true });
  const [msg, setMsg] = useState('');

  const { data } = useQuery({
    queryKey: ['proprietaires', page, search],
    queryFn: () => axios.get(`${API}/proprietaires?page=${page}&search=${search}`).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? axios.put(`${API}/proprietaires/${editId}`, form)
      : axios.post(`${API}/proprietaires`, form),
    onSuccess: () => {
      setMsg(editId ? '✅ Modifié' : '✅ Ajouté');
      setShowForm(false); setEditId(null);
      setForm({ nom: '', telephone: '', email: '', cin: '', adresse: '', nif: '', numStat: '', actif: true });
      queryClient.invalidateQueries({ queryKey: ['proprietaires'] });
    },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/proprietaires/${id}`),
    onSuccess: () => { setMsg('🗑️ Supprimé'); queryClient.invalidateQueries({ queryKey: ['proprietaires'] }); },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const openEdit = (p: any) => {
    setForm({ nom: p.nom, telephone: p.telephone, email: p.email || '', cin: p.cin || '', adresse: p.adresse || '', nif: p.nif || '', numStat: p.numStat || '', actif: p.actif });
    setEditId(p.id);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏢 Propriétaires</h1>
        <button onClick={() => { setEditId(null); setForm({ nom: '', telephone: '', email: '', cin: '', adresse: '', nif: '', numStat: '', actif: true }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> Nouveau
        </button>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg">{editId ? 'Modifier' : 'Ajouter'} un propriétaire</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500">Nom *</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Téléphone *</label><input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">CIN</label><input value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Adresse</label><input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">NIF</label><input value={form.nif} onChange={e => setForm({ ...form, nif: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">N° Statistique</label><input value={form.numStat} onChange={e => setForm({ ...form, numStat: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })} /> Actif</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm"><Save size={14} /> Enregistrer</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm"><X size={14} /> Annuler</button>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400"><th className="p-3">Nom</th><th className="p-3">Téléphone</th><th className="p-3">CIN</th><th className="p-3">Motos</th><th className="p-3">Actions</th></tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {data?.items?.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 font-medium">{p.nom}{p.email && <div className="text-xs text-gray-400">{p.email}</div>}</td>
                <td className="p-3">{p.telephone}</td>
                <td className="p-3">{p.cin || '-'}</td>
                <td className="p-3">
                  {p.motos?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.motos.map((m: any) => <span key={m.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs">🏍️ {m.immatriculation}</span>)}
                    </div>
                  ) : <span className="text-gray-400 text-xs">Aucune</span>}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><Edit size={14} /></button>
                    {p.motos?.length === 0 && (
                      <button onClick={() => { if (confirm('Supprimer ?')) deleteMutation.mutate(p.id); }} className="p-1.5 bg-red-100 text-red-600 rounded-lg"><Trash2 size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.pages > 1 && (
          <div className="flex justify-center gap-2 p-3">
            {Array.from({ length: data.pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

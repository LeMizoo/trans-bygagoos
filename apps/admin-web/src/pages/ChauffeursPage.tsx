import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Users, Search, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useState } from 'react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function ChauffeursPage() {
  const queryClient = useQueryClient();
  const { data: flottes } = useQuery({ queryKey: ["flottes"], queryFn: () => axios.get(`${API}/flottes`).then(r => r.data?.items || r.data) });
  const getFlotteNom = (flotteId: string) => flottes?.find((f: any) => f.id === flotteId)?.nom || "N/A";
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    nom: '', telephone: '', codeAcces: '', email: '', adresse: '',
    cin: '', permisNumero: '', dateEmbauche: '', heurePrisePoste: '07:00', heureFinService: '19:00',
  });

  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs'],
    queryFn: () => axios.get(`${API}/chauffeurs`).then(r => r.data),
    refetchInterval: 15000,
  });



  const liste = Array.isArray(chauffeurs) ? chauffeurs : [];
  const filtered = liste.filter((c: any) =>
    !search || c.nom?.toLowerCase().includes(search.toLowerCase()) || c.codeAcces?.toLowerCase().includes(search.toLowerCase())
  );

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? axios.put(`${API}/chauffeurs/${editId}`, form)
      : axios.post(`${API}/chauffeurs`, form),
    onSuccess: () => {
      setMsg(editId ? '✅ Chauffeur modifié' : '✅ Chauffeur ajouté');
      setShowForm(false); setEditId(null);
      setForm({ nom: '', telephone: '', codeAcces: '', email: '', adresse: '', cin: '', permisNumero: '', dateEmbauche: '', heurePrisePoste: '07:00', heureFinService: '19:00' });
      queryClient.invalidateQueries({ queryKey: ['chauffeurs'] });
    },
    onError: (err: any) => setMsg("❌ " + (err.response?.data?.message || err.response?.data?.error || err.message || "Erreur")),
  });

  const toggleActif = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/chauffeurs/${id}/toggle-actif`),
    onSuccess: () => { setMsg('✅ Statut modifié'); queryClient.invalidateQueries({ queryKey: ['chauffeurs'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/chauffeurs/${id}`).catch(() => axios.put(`${API}/chauffeurs/${id}`, { actif: false })),
    onSuccess: () => { setMsg('🗑️ Chauffeur désactivé'); queryClient.invalidateQueries({ queryKey: ['chauffeurs'] }); },
  });

  const openEdit = (c: any) => {
    setForm({
      nom: c.nom || '', telephone: c.telephone || '', codeAcces: c.codeAcces || '',
      email: c.email || '', adresse: c.adresse || '', cin: c.cin || '',
      permisNumero: c.permisNumero || '', dateEmbauche: c.dateEmbauche?.split('T')[0] || '',
      heurePrisePoste: c.heurePrisePoste || '07:00', heureFinService: c.heureFinService || '19:00',
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const openAdd = () => {
    setForm({ nom: '', telephone: '', codeAcces: '', email: '', adresse: '', cin: '', permisNumero: '', dateEmbauche: '', heurePrisePoste: '07:00', heureFinService: '19:00' });
    setEditId(null);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users size={24} className="text-primary" /> Chauffeurs</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"><Plus size={16} /> Nouveau</button>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg">{editId ? 'Modifier' : 'Ajouter'} un chauffeur</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500">Nom *</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Téléphone *</label><input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Code accès</label><input value={form.codeAcces} onChange={e => setForm({ ...form, codeAcces: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">CIN</label><input value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Permis</label><input value={form.permisNumero} onChange={e => setForm({ ...form, permisNumero: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Adresse</label><input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Date embauche</label><input type="date" value={form.dateEmbauche} onChange={e => setForm({ ...form, dateEmbauche: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Heure prise poste</label><input type="time" value={form.heurePrisePoste} onChange={e => setForm({ ...form, heurePrisePoste: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Heure fin service</label><input type="time" value={form.heureFinService} onChange={e => setForm({ ...form, heureFinService: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
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
          <thead><tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
            <th className="p-3">Chauffeur</th><th className="p-3">Code</th><th className="p-3">Téléphone</th><th className="p-3">Moto</th><th className="p-3">Statut</th><th className="p-3 text-center">Actions</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {filtered.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 text-xs text-gray-400">{getFlotteNom(c.flotteId)}</td>
                <td className="p-3 font-medium">{c.nom}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded font-mono text-xs">{c.codeAcces}</span></td>
                <td className="p-3 text-xs">{c.telephone}</td>
                <td className="p-3 text-xs">{c.moto?.immatriculation || <span className="text-red-400">Sans moto</span>}</td>
                <td className="p-3">
                  <button onClick={() => toggleActif.mutate(c.id)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.actif !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.actif !== false ? '✅ Actif' : '❌ Inactif'}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 bg-orange-100 dark:bg-orange-500/10 text-orange-600 rounded-lg"><Edit size={14} /></button>
                    <button onClick={() => { if (confirm('Désactiver ce chauffeur ?')) deleteMutation.mutate(c.id); }} className="p-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bike, Search, Plus, Edit, Trash2, X, Save, User } from 'lucide-react';
import { useState } from 'react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function VehiculesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    immatriculation: '', marque: '', modele: '', cylindree: '', couleur: '',
    kmActuel: 0, prixAchat: 0, dateAchat: '', numMoteur: '', numChassis: '',
    proprietaireNom: '', proprietaireTelephone: '', proprietaireCin: '',
  });

  const { data: motos } = useQuery({
    queryKey: ['motos'],
    queryFn: () => axios.get(`${API}/motos`).then(r => r.data), // SUPER_ADMIN: toutes les motos
    refetchInterval: 15000,
  });
  const nbVéhicules = Array.isArray(motos) ? motos.length : 0;
  const flotteId = JSON.parse(localStorage.getItem("user")||"{}")?.flotteId;
  const { data: flottes } = useQuery({ queryKey: ['flottes'], queryFn: () => axios.get(`${API}/flottes`).then(r => r.data?.items || r.data) });
  const getFlotteNom = (flotteId: string) => flottes?.find((f: any) => f.id === flotteId)?.nom || 'N/A';
  const { data: flotte } = useQuery({ queryKey: ["flotte-motos", flotteId], queryFn: () => axios.get(`${API}/flottes/${flotteId}`).then(r => r.data), enabled: !!flotteId });
  const limiteVéhicules = flotte?.abonnement === "GRATUIT" ? 1 : flotte?.abonnement === "2_5" ? 5 : flotte?.abonnement === "6_10" ? 10 : 999;
  const peutAjouter = nbVéhicules < limiteVéhicules;

  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs-sans-moto'],
    queryFn: () => axios.get(`${API}/chauffeurs`).then(r => r.data?.filter((c: any) => !c.motoId)),
  });

  const liste = Array.isArray(motos) ? motos : [];
  const filtered = liste.filter((m: any) =>
    !search || m.immatriculation?.toLowerCase().includes(search.toLowerCase()) || m.marque?.toLowerCase().includes(search.toLowerCase())
  );

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? axios.put(`${API}/motos/${editId}`, form)
      : axios.post(`${API}/motos`, { ...form, flotteId: JSON.parse(localStorage.getItem("user")||"{}")?.flotteId }),
    onSuccess: () => {
      setMsg(editId ? '✅ Moto modifiée' : '✅ Moto ajoutée');
      setShowForm(false); setEditId(null);
      setForm({ immatriculation: '', marque: '', modele: '', cylindree: '', couleur: '', kmActuel: 0, prixAchat: 0, dateAchat: '', numMoteur: '', numChassis: '', proprietaireNom: '', proprietaireTelephone: '', proprietaireCin: '' });
      queryClient.invalidateQueries({ queryKey: ['motos'] });
    },
    onError: (err: any) => setMsg("❌ " + (err.response?.data?.message || err.response?.data?.error || err.message || "Erreur")),
  });

  const assignMutation = useMutation({
    mutationFn: ({ motoId, chauffeurId }: { motoId: string; chauffeurId: string }) =>
      axios.post(`${API}/motos/${motoId}/assigner`, { chauffeurId }),
    onSuccess: () => { setMsg('✅ Moto assignée'); queryClient.invalidateQueries({ queryKey: ['motos'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/motos/${id}`),
    onSuccess: () => { setMsg('🗑️ Moto supprimée'); queryClient.invalidateQueries({ queryKey: ['motos'] }); },
  });

  const openEdit = (m: any) => {
    setForm({
      immatriculation: m.immatriculation || '', marque: m.marque || '', modele: m.modele || '',
      cylindree: m.cylindree || '', couleur: m.couleur || '', kmActuel: m.kmActuel || 0,
      prixAchat: m.prixAchat || 0, dateAchat: m.dateAchat?.split('T')[0] || '',
      numMoteur: m.numMoteur || '', numChassis: m.numChassis || '',
      proprietaireNom: m.proprietaireNom || '', proprietaireTelephone: m.proprietaireTelephone || '', proprietaireCin: m.proprietaireCin || '',
    });
    setEditId(m.id);
    setShowForm(true);
  };

  const handleNouvelleMoto = () => {
    if (!peutAjouter) {
      setMsg("🚫 Limite atteinte : votre plan " + (flotte?.abonnement || "GRATUIT") + " autorise seulement " + limiteVéhicules + " moto(s). Passez au plan supérieur.");
      return;
    }
    setEditId(null);
    setForm({ immatriculation: '', marque: '', modele: '', cylindree: '', couleur: '', kmActuel: 0, prixAchat: 0, dateAchat: '', numMoteur: '', numChassis: '', proprietaireNom: '', proprietaireTelephone: '', proprietaireCin: '' });
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Bike size={24} className="text-primary" /> Véhicules</h1>
      {!peutAjouter && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">🚫 Vous avez atteint la limite de {limiteVéhicules} moto(s) pour votre plan {flotte?.abonnement || "GRATUIT"}. <a href="/app/abonnements" className="underline font-bold">Changer de plan →</a></div>}
        <button onClick={handleNouvelleMoto}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"><Plus size={16} /> Nouvelle</button>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg">{editId ? 'Modifier' : 'Ajouter'} une moto</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500">Immatriculation *</label><input value={form.immatriculation} onChange={e => setForm({ ...form, immatriculation: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Marque</label><input value={form.marque} onChange={e => setForm({ ...form, marque: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Modèle</label><input value={form.modele} onChange={e => setForm({ ...form, modele: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Cylindrée</label><input value={form.cylindree} onChange={e => setForm({ ...form, cylindree: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Couleur</label><input value={form.couleur} onChange={e => setForm({ ...form, couleur: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Km actuels</label><input type="number" value={form.kmActuel} onChange={e => setForm({ ...form, kmActuel: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Prix achat</label><input type="number" value={form.prixAchat} onChange={e => setForm({ ...form, prixAchat: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Date achat</label><input type="date" value={form.dateAchat} onChange={e => setForm({ ...form, dateAchat: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">N° Moteur</label><input value={form.numMoteur} onChange={e => setForm({ ...form, numMoteur: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">N° Châssis</label><input value={form.numChassis} onChange={e => setForm({ ...form, numChassis: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Propriétaire nom</label><input value={form.proprietaireNom} onChange={e => setForm({ ...form, proprietaireNom: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500">Propriétaire tél</label><input value={form.proprietaireTelephone} onChange={e => setForm({ ...form, proprietaireTelephone: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm"><Save size={14} /> Enregistrer</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm"><X size={14} /> Annuler</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m: any) => (
          <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div><span className="text-xs text-gray-400">🏢 {getFlotteNom(m.flotteId)}</span><h3 className="font-semibold">{m.immatriculation}</h3></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(m)} className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><Edit size={14} /></button>
                <button onClick={() => { if (confirm('Supprimer ?')) deleteMutation.mutate(m.id); }} className="p-1.5 bg-red-100 text-red-600 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-500">{m.marque} {m.modele} · {m.kmActuel?.toLocaleString()} km</p>
            {m.chauffeur ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600"><User size={14} /> {m.chauffeur?.nom}</div>
            ) : (
              <select onChange={e => e.target.value && assignMutation.mutate({ motoId: m.id, chauffeurId: e.target.value })}
                className="mt-2 w-full px-2 py-1 border rounded text-xs dark:bg-gray-700">
                <option value="">+ Assigner chauffeur</option>
                {chauffeurs?.filter((c: any) => !c.motoId).map((c: any) => <option key={c.id} value={c.id}>{c.nom} ({c.codeAcces})</option>)}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

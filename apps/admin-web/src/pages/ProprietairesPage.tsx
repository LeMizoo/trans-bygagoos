import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, Edit, Trash2, User, Phone, Mail, Bike, X, Save, MapPin, FileText, Hash, Calendar } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

// ── Fiche détail Propriétaire ──
function FicheProprietaire({ proprietaire, onClose }: { proprietaire: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 z-10 animate-in fade-in zoom-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><User size={22} className="text-primary" /> {proprietaire.nom}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Téléphone" value={proprietaire.telephone} icon={<Phone size={14} />} />
          <Info label="Email" value={proprietaire.email} icon={<Mail size={14} />} />
          <Info label="CIN" value={proprietaire.cin} icon={<FileText size={14} />} />
          <Info label="Adresse" value={proprietaire.adresse} icon={<MapPin size={14} />} />
          <Info label="NIF" value={proprietaire.nif} icon={<Hash size={14} />} />
          <Info label="N° Statistique" value={proprietaire.numStat} icon={<FileText size={14} />} />
        </div>
        <div className="border-t pt-3 dark:border-gray-700">
          <h4 className="font-semibold mb-2 text-sm">🏍️ Motos associées ({proprietaire.motos?.length || 0})</h4>
          <div className="flex flex-wrap gap-2">
            {proprietaire.motos?.map((m: any) => (
              <span key={m.id} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">🏍️ {m.immatriculation}</span>
            ))}
            {(!proprietaire.motos || proprietaire.motos.length === 0) && <span className="text-gray-400 text-sm">Aucune moto</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fiche détail Moto ──
function FicheMoto({ moto, onClose }: { moto: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><Bike size={22} className="text-primary" /> {moto.immatriculation}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Marque" value={moto.marque} />
          <Info label="Modèle" value={moto.modele} />
          <Info label="Cylindrée" value={moto.cylindree} />
          <Info label="Couleur" value={moto.couleur} />
          <Info label="KM Actuel" value={moto.kmActuel?.toLocaleString()} />
          <Info label="Statut" value={moto.statut} />
          <Info label="N° Moteur" value={moto.numMoteur} />
          <Info label="N° Châssis" value={moto.numChassis} />
          <Info label="Prix Achat" value={moto.prixAchat ? `${moto.prixAchat.toLocaleString()} Ar` : ''} />
          <Info label="Date Achat" value={moto.dateAchat ? new Date(moto.dateAchat).toLocaleDateString('fr') : ''} />
          <Info label="Prochaine Vidange" value={moto.kmProchaineVidange ? `${moto.kmProchaineVidange.toLocaleString()} km` : ''} />
          <Info label="Assurance fin" value={moto.finAssurance ? new Date(moto.finAssurance).toLocaleDateString('fr') : ''} />
          <Info label="Vignette fin" value={moto.finVignette ? new Date(moto.finVignette).toLocaleDateString('fr') : ''} />
        </div>
        {moto.chauffeur && (
          <div className="border-t pt-3 dark:border-gray-700">
            <h4 className="font-semibold mb-1 text-sm">👤 Chauffeur assigné</h4>
            <p className="text-sm">{moto.chauffeur.nom} · {moto.chauffeur.telephone}</p>
          </div>
        )}
        {moto.proprietaire && (
          <div className="border-t pt-3 dark:border-gray-700">
            <h4 className="font-semibold mb-1 text-sm">🏢 Propriétaire</h4>
            <p className="text-sm">{moto.proprietaire.nom} · {moto.proprietaire.telephone}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
      <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">{icon}{label}</div>
      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}

// ── Page Principale ──
export function ProprietairesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [ficheProprietaire, setFicheProprietaire] = useState<any>(null);
  const [ficheMoto, setFicheMoto] = useState<any>(null);
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', cin: '', adresse: '', nif: '', numStat: '', actif: true });
  const [msg, setMsg] = useState('');

  const { data } = useQuery({
    queryKey: ['proprietaires', page, search],
    queryFn: () => axios.get(`${API}/proprietaires?page=${page}&search=${search}`).then(r => r.data),
  });

  const { data: motos } = useQuery({
    queryKey: ['motos-liste'],
    queryFn: () => axios.get(`${API}/motos`).then(r => r.data),
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

  // Fonction pour récupérer les infos complètes d'une moto
  const getMotoFull = (immatriculation: string) => {
    const found = (Array.isArray(motos) ? motos : []).find((m: any) => m.immatriculation === immatriculation);
    if (found) setFicheMoto(found);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Fiches détail */}
      {ficheProprietaire && <FicheProprietaire proprietaire={ficheProprietaire} onClose={() => setFicheProprietaire(null)} />}
      {ficheMoto && <FicheMoto moto={ficheMoto} onClose={() => setFicheMoto(null)} />}

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
                <td className="p-3">
                  <button onClick={() => setFicheProprietaire(p)} className="font-medium text-primary hover:underline text-left">
                    {p.nom}
                  </button>
                  {p.email && <div className="text-xs text-gray-400">{p.email}</div>}
                </td>
                <td className="p-3">{p.telephone}</td>
                <td className="p-3">{p.cin || '-'}</td>
                <td className="p-3">
                  {p.motos?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.motos.map((m: any) => (
                        <button key={m.id} onClick={() => getMotoFull(m.immatriculation)}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 hover:bg-primary/20 rounded text-xs transition-colors">
                          🏍️ {m.immatriculation}
                        </button>
                      ))}
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

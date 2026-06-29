import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Search, Plus, Edit, Trash2, User, Phone, Mail, Bike, X, Save, MapPin, FileText, Hash, Calendar,
  Wrench, DollarSign, TrendingUp, TrendingDown, Activity, Gauge, Shield, AlertTriangle
} from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const catColors: Record<string, string> = {
  CARBURANT: 'bg-orange-100 text-orange-700',
  ENTRETIEN: 'bg-blue-100 text-blue-700',
  PIECE: 'bg-purple-100 text-purple-700',
  ASSURANCE: 'bg-green-100 text-green-700',
  PNEU: 'bg-yellow-100 text-yellow-700',
  REPARATION: 'bg-red-100 text-red-700',
  AUTRE: 'bg-gray-100 text-gray-700',
};

const catLabels: Record<string, string> = {
  CARBURANT: '⛽ Carburant',
  ENTRETIEN: '🔧 Entretien',
  PIECE: '🔩 Pièces',
  ASSURANCE: '🛡️ Assurance',
  PNEU: '🛞 Pneu',
  REPARATION: '🔨 Réparation',
  AUTRE: '📝 Autre',
};

// ── Fiche Détaillée Moto ──
function FicheMoto({ motoId, onClose }: { motoId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['moto-stats', motoId],
    queryFn: () => axios.get(`${API}/motos/${motoId}/stats`).then(r => r.data),
    enabled: !!motoId,
  });

  if (isLoading) return <Modal onClose={onClose}><div className="text-center py-8">Chargement...</div></Modal>;
  if (!data) return <Modal onClose={onClose}><div className="text-center py-8 text-red-500">Moto introuvable</div></Modal>;

  const { moto, proprietaire, chauffeur, stats, depensesByCategorie, coursesByType, depenses, courses } = data;

  return (
    <Modal onClose={onClose} large>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bike size={24} className="text-primary" /> {moto.immatriculation}
          </h2>
          <p className="text-sm text-gray-500">{moto.marque} {moto.modele} · {moto.cylindree} · {moto.couleur}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${moto.statut === 'en_service' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {moto.statut === 'en_service' ? '🟢 En service' : '⚪ Disponible'}
        </span>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<DollarSign size={18} />} label="CA Total" value={`${stats.totalCA.toLocaleString()} Ar`} color="text-green-600" />
        <StatCard icon={<TrendingDown size={18} />} label="Dépenses" value={`${stats.totalDepenses.toLocaleString()} Ar`} color="text-red-600" />
        <StatCard icon={<TrendingUp size={18} />} label="Gain Net" value={`${stats.gainNet.toLocaleString()} Ar`} color={stats.gainNet >= 0 ? 'text-blue-600' : 'text-red-600'} />
        <StatCard icon={<Activity size={18} />} label="Courses" value={`${stats.totalCourses}`} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonne gauche : Infos techniques */}
        <div className="space-y-4">
          <Section title="📋 Informations techniques">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info label="N° Moteur" value={moto.numMoteur} />
              <Info label="N° Châssis" value={moto.numChassis} />
              <Info label="KM Actuel" value={`${moto.kmActuel?.toLocaleString()} km`} />
              <Info label="Prochaine Vidange" value={`${moto.kmProchaineVidange?.toLocaleString()} km`} />
              <Info label="Assurance fin" value={moto.finAssurance ? new Date(moto.finAssurance).toLocaleDateString('fr') : '-'} />
              <Info label="Vignette fin" value={moto.finVignette ? new Date(moto.finVignette).toLocaleDateString('fr') : '-'} />
              <Info label="Prix Achat" value={moto.prixAchat ? `${moto.prixAchat.toLocaleString()} Ar` : '-'} />
              <Info label="Date Achat" value={moto.dateAchat ? new Date(moto.dateAchat).toLocaleDateString('fr') : '-'} />
            </div>
          </Section>

          {chauffeur && (
            <Section title="👤 Chauffeur actuel">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                <User size={20} className="text-green-600" />
                <div>
                  <p className="font-medium">{chauffeur.nom}</p>
                  <p className="text-xs text-gray-500">{chauffeur.telephone}</p>
                </div>
              </div>
            </Section>
          )}

          {proprietaire && (
            <Section title="🏢 Propriétaire">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <User size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium">{proprietaire.nom}</p>
                  <p className="text-xs text-gray-500">{proprietaire.telephone}</p>
                </div>
              </div>
            </Section>
          )}
        </div>

        {/* Colonne droite : Stats financières */}
        <div className="space-y-4">
          <Section title="💰 Recettes par type">
            {Object.entries(coursesByType).map(([type, val]: [string, any]) => (
              <div key={type} className="flex justify-between items-center py-1 border-b dark:border-gray-700 last:border-0">
                <span className="text-sm">{type}</span>
                <span className="text-sm font-medium">{val.total.toLocaleString()} Ar <span className="text-xs text-gray-400">({val.count})</span></span>
              </div>
            ))}
            {Object.keys(coursesByType).length === 0 && <p className="text-gray-400 text-sm">Aucune course</p>}
          </Section>

          <Section title="🔧 Dépenses par catégorie">
            {Object.entries(depensesByCategorie).map(([cat, montant]) => (
              <div key={cat} className="flex justify-between items-center py-1 border-b dark:border-gray-700 last:border-0">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${catColors[cat] || 'bg-gray-100'}`}>{catLabels[cat] || cat}</span>
                <span className="text-sm font-medium text-red-600">-{montant.toLocaleString()} Ar</span>
              </div>
            ))}
            {Object.keys(depensesByCategorie).length === 0 && <p className="text-gray-400 text-sm">Aucune dépense</p>}
          </Section>
        </div>
      </div>

      {/* Historique dépenses */}
      {depenses?.length > 0 && (
        <Section title="📜 Dernières interventions" className="mt-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {depenses.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${catColors[d.categorie] || 'bg-gray-100'}`}>{catLabels[d.categorie] || d.categorie}</span>
                  <span className="ml-2">{d.description}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{new Date(d.date).toLocaleDateString('fr')}</span>
                  <span className="font-medium text-red-600">-{d.montant.toLocaleString()} Ar</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </Modal>
  );
}

// ── Fiche Détaillée Propriétaire ──
function FicheProprietaire({ proprietaire, onClose }: { proprietaire: any; onClose: () => void }) {
  const { data: motosData } = useQuery({
    queryKey: ['motos-liste'],
    queryFn: () => axios.get(`${API}/motos`).then(r => r.data),
  });

  const motosProprio = Array.isArray(motosData)
    ? motosData.filter((m: any) => m.proprietaireId === proprietaire.id)
    : [];

  // Calculs
  const totalCA = motosProprio.reduce((sum: number, m: any) =>
    sum + (m.courses || []).reduce((s: number, c: any) => s + c.prix, 0), 0);
  const totalDepenses = motosProprio.reduce((sum: number, m: any) =>
    sum + (m.depenses || []).reduce((s: number, d: any) => s + d.montant, 0), 0);
  const totalCommission = motosProprio.reduce((sum: number, m: any) =>
    sum + (m.courses || []).reduce((s: number, c: any) => s + c.commission, 0), 0);

  return (
    <Modal onClose={onClose} large>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User size={24} className="text-primary" /> {proprietaire.nom}
        </h2>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
      </div>

      {/* Infos proprio */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Info label="Téléphone" value={proprietaire.telephone} icon={<Phone size={14} />} />
        <Info label="Email" value={proprietaire.email} icon={<Mail size={14} />} />
        <Info label="CIN" value={proprietaire.cin} icon={<FileText size={14} />} />
        <Info label="Adresse" value={proprietaire.adresse} icon={<MapPin size={14} />} />
        <Info label="NIF" value={proprietaire.nif} icon={<Hash size={14} />} />
        <Info label="N° Statistique" value={proprietaire.numStat} icon={<FileText size={14} />} />
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Bike size={18} />} label="Motos" value={`${motosProprio.length}`} color="text-primary" />
        <StatCard icon={<DollarSign size={18} />} label="CA Total" value={`${totalCA.toLocaleString()} Ar`} color="text-green-600" />
        <StatCard icon={<TrendingDown size={18} />} label="Dépenses" value={`${totalDepenses.toLocaleString()} Ar`} color="text-red-600" />
        <StatCard icon={<TrendingUp size={18} />} label="Gain Net" value={`${(totalCA - totalCommission - totalDepenses).toLocaleString()} Ar`} color="text-blue-600" />
      </div>

      {/* Liste des motos */}
      <Section title="🏍️ Motos">
        {motosProprio.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune moto</p>
        ) : (
          <div className="space-y-2">
            {motosProprio.map((m: any) => {
              const caMoto = (m.courses || []).reduce((s: number, c: any) => s + c.prix, 0);
              const depMoto = (m.depenses || []).reduce((s: number, d: any) => s + d.montant, 0);
              return (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bike size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">{m.immatriculation}</p>
                      <p className="text-xs text-gray-500">{m.marque} {m.modele} · {m.chauffeur ? `👤 ${m.chauffeur.nom}` : 'Sans chauffeur'}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-green-600 font-medium">+{caMoto.toLocaleString()} Ar</p>
                    <p className="text-red-500 text-xs">-{depMoto.toLocaleString()} Ar</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </Modal>
  );
}

// ── Composants réutilisables ──
function Modal({ children, onClose, large }: { children: React.ReactNode; onClose: () => void; large?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full p-6 z-10 animate-in fade-in zoom-in ${large ? 'max-w-3xl' : 'max-w-lg'}`}>
        {children}
      </div>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">{title}</h4>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
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
  const [ficheMotoId, setFicheMotoId] = useState<string | null>(null);
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

  const getMotoId = (immatriculation: string) => {
    const found = (Array.isArray(motos) ? motos : []).find((m: any) => m.immatriculation === immatriculation);
    if (found) setFicheMotoId(found.id);
  };

  return (
    <div className="p-6 space-y-6">
      {ficheProprietaire && <FicheProprietaire proprietaire={ficheProprietaire} onClose={() => setFicheProprietaire(null)} />}
      {ficheMotoId && <FicheMoto motoId={ficheMotoId} onClose={() => setFicheMotoId(null)} />}

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
                        <button key={m.id} onClick={() => getMotoId(m.immatriculation)}
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Receipt, Plus, Edit, Trash2, X, Save, Search } from 'lucide-react';
import { useState } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

const categories = [
  { value: 'CARBURANT', label: '⛽ Carburant', icon: '⛽' },
  { value: 'ENTRETIEN', label: '🔧 Entretien', icon: '🔧' },
  { value: 'PIECE', label: '🔩 Pièces', icon: '🔩' },
  { value: 'ASSURANCE', label: '🛡️ Assurance', icon: '🛡️' },
  { value: 'PNEU', label: '🛞 Pneu', icon: '🛞' },
  { value: 'REPARATION', label: '🔨 Réparation', icon: '🔨' },
  { value: 'AUTRE', label: '📝 Autre', icon: '📝' },
];

export function DepensesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('tous');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    description: '', montant: 0, categorie: 'CARBURANT',
    motoId: '', litres: 0, station: '',
  });

  const { data } = useQuery({
    queryKey: ['depenses', page, categorieFilter],
    queryFn: () => axios.get(`${API}/depenses?page=${page}&categorie=${categorieFilter}`).then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: stats } = useQuery({
    queryKey: ['depenses-stats'],
    queryFn: () => axios.get(`${API}/depenses/stats?periode=mois`).then(r => r.data),
  });

  const { data: motos } = useQuery({
    queryKey: ['motos-liste'],
    queryFn: () => axios.get(`${API}/motos`).then(r => r.data),
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const filtered = items.filter((d: any) =>
    !search || d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? axios.put(`${API}/depenses/${editId}`, form)
      : axios.post(`${API}/depenses`, form),
    onSuccess: () => {
      setMsg(editId ? '✅ Modifiée' : '✅ Ajoutée');
      setShowForm(false); setEditId(null);
      setForm({ description: '', montant: 0, categorie: 'CARBURANT', motoId: '', litres: 0, station: '' });
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
      queryClient.invalidateQueries({ queryKey: ['depenses-stats'] });
    },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/depenses/${id}`),
    onSuccess: () => { setMsg('🗑️ Supprimée'); queryClient.invalidateQueries({ queryKey: ['depenses'] }); },
  });

  const openEdit = (d: any) => {
    setForm({
      description: d.description, montant: d.montant, categorie: d.categorie,
      motoId: d.motoId || '', litres: d.litres || 0, station: d.station || '',
    });
    setEditId(d.id);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Receipt size={24} className="text-primary" /> Dépenses
        </h1>
        <button onClick={() => { setEditId(null); setForm({ description: '', montant: 0, categorie: 'CARBURANT', motoId: '', litres: 0, station: '' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"><Plus size={16} /> Nouvelle</button>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.totalDepenses?.toLocaleString()} Ar</div>
            <div className="text-xs text-gray-500">Total {stats.periode}</div>
          </div>
          {stats.parCategorie?.slice(0, 3).map((c: any) => (
            <div key={c.categorie} className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
              <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{c.montant?.toLocaleString()} Ar</div>
              <div className="text-xs text-gray-500">{c.label || c.categorie}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <select value={categorieFilter} onChange={e => { setCategorieFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
          <option value="tous">Toutes catégories</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg">{editId ? 'Modifier' : 'Ajouter'} une dépense</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Description *</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" placeholder="Ex: Plein essence" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Montant (Ar) *</label>
              <input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Catégorie</label>
              <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Moto</label>
              <select value={form.motoId} onChange={e => setForm({ ...form, motoId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                <option value="">Toutes</option>
                {Array.isArray(motos) && motos.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.immatriculation}</option>
                ))}
              </select>
            </div>
            {form.categorie === "CARBURANT" && (
              <>
                <div>
                  <label className="text-xs text-gray-500">Litres</label>
                  <input type="number" step="0.1" value={form.litres} onChange={e => setForm({ ...form, litres: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Station</label>
                  <input value={form.station} onChange={e => setForm({ ...form, station: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" placeholder="Ex: Total Ankorondrano" />
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm"><Save size={14} /> Enregistrer</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm"><X size={14} /> Annuler</button>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-2">
        {filtered.map((d: any) => (
          <div key={d.id} className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center justify-between hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-lg">
                {categories.find(c => c.value === d.categorie)?.icon || '📝'}
              </div>
              <div>
                <p className="font-medium">{d.description}</p>
                <p className="text-xs text-gray-500">
                  {categories.find(c => c.value === d.categorie)?.label || d.categorie}
                  {d.moto?.immatriculation && ` · 🏍️ ${d.moto.immatriculation}`}
                  {d.litres > 0 && ` · ${d.litres}L`}
                  {d.station && ` · ${d.station}`}
                  {' · '}{new Date(d.date).toLocaleDateString('fr')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-500">-{d.montant?.toLocaleString()} Ar</span>
              <button onClick={() => openEdit(d)} className="p-1.5 bg-orange-100 dark:bg-orange-500/10 text-orange-600 rounded-lg"><Edit size={14} /></button>
              <button onClick={() => { if (confirm('Supprimer ?')) deleteMutation.mutate(d.id); }} className="p-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucune dépense</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Search, Plus, Edit, Trash2, UserPlus, Shield, Key, X, Save, Mail, Lock, User
} from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const ROLES = [
  { value: "SUPER_ADMIN", label: "👑 Super Admin", desc: "Tous les droits + gestion des admins" },
  { value: 'ADMIN', label: '🔑 Admin', desc: 'Tous les droits' },
  { value: 'FINANCE', label: '💰 Finance', desc: 'Dépenses, versements, rapports' },
  { value: 'LOGISTIQUE', label: '🏍️ Logistique', desc: 'Motos, chauffeurs, contrats' },
  { value: 'PROPRIETAIRE', label: '🏢 Propriétaire', desc: 'Voir ses motos et recettes' },
  { value: 'SUPPORT', label: '🆘 Support', desc: 'Assistance et messages' },
];

export function UtilisateursPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    nom: '', email: '', password: '', role: 'PROPRIETAIRE', actif: true,
  });

  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => axios.get(`${API}/users`).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? axios.put(`${API}/users/${editId}`, form)
      : axios.post(`${API}/users`, form),
    onSuccess: () => {
      setMsg(editId ? '✅ Utilisateur modifié' : '✅ Utilisateur créé');
      setShowForm(false); setEditId(null);
      setForm({ nom: '', email: '', password: '', role: 'PROPRIETAIRE', actif: true });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/users/${id}`),
    onSuccess: () => { setMsg('🗑️ Utilisateur supprimé'); queryClient.invalidateQueries({ queryKey: ['users'] }); },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const openEdit = (u: any) => {
    setForm({ nom: u.nom, email: u.email, password: '', role: u.role, actif: u.actif });
    setEditId(u.id);
    setShowForm(true);
  };

  const users = Array.isArray(data) ? data : data?.items || [];
  const filtered = users.filter((u: any) =>
    !search || u.nom?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className="text-primary" /> Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les accès à l'administration : propriétaires, financiers, logistique...</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm({ nom: '', email: '', password: '', role: 'PROPRIETAIRE', actif: true }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"
        >
          <UserPlus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <User size={18} /> {editId ? 'Modifier' : 'Ajouter'} un utilisateur
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Nom complet *</label>
              <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" placeholder="Ex: Rakoto Jean" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" placeholder="jean@email.com" />
            </div>
            <div>
              <label className="text-xs text-gray-500">
                {editId ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}
              </label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Rôle</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Aperçu des droits du rôle sélectionné */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
            <span className="text-gray-500">Droits :</span>{' '}
            <span className="font-medium">{ROLES.find(r => r.value === form.role)?.desc}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate()} disabled={!form.nom || !form.email || (!editId && !form.password)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50">
              <Save size={14} /> Enregistrer
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm">
              <X size={14} /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm" />
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid gap-3">
        {filtered.map((u: any) => (
          <div key={u.id || u.email} className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{u.nom}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail size={12} /> {u.email}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                u.role === 'FINANCE' ? 'bg-green-100 text-green-700' :
                u.role === 'LOGISTIQUE' ? 'bg-blue-100 text-blue-700' :
                u.role === 'PROPRIETAIRE' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {ROLES.find(r => r.value === u.role)?.label || u.role}
              </span>
              {!u.actif && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">Inactif</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(u)} className="p-2 bg-orange-100 dark:bg-orange-500/10 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                <Edit size={14} />
              </button>
              {u.role !== 'ADMIN' && (
                <button onClick={() => { if (confirm(`Supprimer ${u.nom} ?`)) deleteMutation.mutate(u.id); }}
                  className="p-2 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <User size={48} className="mx-auto mb-3 opacity-30" />
            <p>Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Résumé des rôles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
        <h3 className="font-semibold text-sm mb-3">📋 Rôles disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ROLES.map(r => (
            <div key={r.value} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="font-medium text-sm">{r.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {users.filter((u: any) => u.role === r.value).length} utilisateur(s)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

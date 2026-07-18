import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, UserPlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client';

export function UtilisateursPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'ADMIN' });

  const { data, isLoading } = useQuery({
    queryKey: ['utilisateurs'],
    queryFn: () => api.get('/utilisateurs').then(r => r.data),
  });

  const createUser = useMutation({
    mutationFn: (userData: any) => api.post('/utilisateurs', userData),
    onSuccess: () => { setShowForm(false); qc.invalidateQueries({ queryKey: ['utilisateurs'] }); },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/utilisateurs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['utilisateurs'] }),
  });

  const users = Array.isArray(data) ? data : [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} /> Utilisateurs
          </h1>
          <p className="text-gray-500 mt-1">{users.length} utilisateur(s)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <UserPlus size={18} /> Nouvel utilisateur
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border">
          <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Nom"
            className="w-full mb-2 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email"
            className="w-full mb-2 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
          <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mot de passe" type="password"
            className="w-full mb-2 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
            className="w-full mb-3 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600">
            <option value="ADMIN">Admin</option>
            <option value="GERANT_FLOTTE">Gérant Flotte</option>
            <option value="GERANT_COOP">Gérant Coop</option>
            <option value="CHAUFFEUR">Chauffeur</option>
            <option value="LIVREUR">Livreur</option>
          </select>
          <button onClick={() => createUser.mutate(form)}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Créer l'utilisateur
          </button>
        </div>
      )}

      <div className="space-y-2">
        {users.map((u: any) => (
          <div key={u.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border flex items-center justify-between">
            <div>
              <div className="font-bold">{u.nom} {u.prenom}</div>
              <div className="text-sm text-gray-500">{u.email}</div>
              <div className="text-xs text-gray-400">{u.role}</div>
            </div>
            <button onClick={() => { if (confirm('Supprimer ?')) deleteUser.mutate(u.id); }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

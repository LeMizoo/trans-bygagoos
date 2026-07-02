import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Shield, UserPlus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function UtilisateursPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'ADMIN' });

  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => axios.get(`${API}/users`).then(r => r.data),
  });

  const createUser = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/users`, data),
    onSuccess: () => { setShowForm(false); qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const users = Array.isArray(data) ? data : [];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={24} /> Utilisateurs</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <UserPlus size={16} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="grid grid-cols-4 gap-3">
            <input type="text" placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm" />
            <input type="password" placeholder="Mot de passe" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm" />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm">
              <option value="ADMIN">ADMIN</option>
              <option value="FINANCE">FINANCE</option>
              <option value="SUPPORT">SUPPORT</option>
            </select>
          </div>
          <button onClick={() => createUser.mutate(form)} disabled={createUser.isPending} className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">Créer</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left bg-gray-50 dark:bg-gray-900">
              <th className="p-3 text-gray-500 font-medium">Nom</th>
              <th className="p-3 text-gray-500 font-medium">Email</th>
              <th className="p-3 text-gray-500 font-medium">Rôle</th>
              <th className="p-3 text-gray-500 font-medium">Flotte</th>
              <th className="p-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-3 font-medium">{u.nom}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">{u.role}</span></td>
                <td className="p-3 text-gray-400">{u.flotte?.nom || '-'}</td>
                <td className="p-3">
                  <button onClick={() => deleteUser.mutate(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { UserPlus, Shield, Key } from 'lucide-react';

export function UtilisateursPage() {
  const users = [
    { nom: 'Admin', email: 'admin@bygagoos.com', role: 'ADMIN' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👥 Utilisateurs</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium">
          <UserPlus size={16} /> Nouvel utilisateur
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500"><th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3">Rôle</th><th className="p-3">Actions</th></tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 font-medium">{u.nom}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{u.role}</span></td>
                <td className="p-3">
                  <button className="p-1.5 bg-orange-100 text-orange-600 rounded-lg mr-1"><Key size={14} /></button>
                  <button className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Shield size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

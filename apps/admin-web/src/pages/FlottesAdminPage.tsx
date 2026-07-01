import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Building2, CheckCircle, XCircle } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function FlottesAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['flottes-admin'],
    queryFn: () => axios.get(`${API}/flottes`).then(r => r.data),
    refetchInterval: 30000,
  });

  const flottes = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🏢 Gestion des Flottes</h1>
      <div className="grid gap-4">
        {flottes.map((f: any) => (
          <div key={f.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{f.nom}</h3>
              <p className="text-sm text-gray-500">{f.email || 'Pas d\'email'}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle size={12} /> Actif
            </span>
          </div>
        ))}
        {flottes.length === 0 && !isLoading && (
          <p className="text-gray-500 text-center py-8">Aucune flotte enregistrée.</p>
        )}
      </div>
    </div>
  );
}

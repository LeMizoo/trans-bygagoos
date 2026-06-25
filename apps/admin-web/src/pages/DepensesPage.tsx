import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { } from 'lucide-react';

import { API_URL } from '../lib/api';
const API = API_URL;

export function DepensesPage() {
  const { data } = useQuery({
    queryKey: ['depenses'],
    queryFn: () => axios.get(`${API}/depenses`).then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['depenses-stats'],
    queryFn: () => axios.get(`${API}/depenses/stats`).then(r => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dépenses</h1>
      {stats && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total dépenses</p>
          <p className="text-3xl font-bold text-red-600">{stats.totalDepenses.toLocaleString()} Ar</p>
        </div>
      )}
      <div className="space-y-2">
        {data?.map((d: any) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{d.description}</p>
              <p className="text-xs text-gray-500">{d.categorie} · {new Date(d.date).toLocaleDateString('fr')}</p>
            </div>
            <p className="font-bold text-red-500">-{d.montant.toLocaleString()} Ar</p>
          </div>
        ))}
      </div>
    </div>
  );
}

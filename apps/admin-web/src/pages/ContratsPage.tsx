import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FileText } from 'lucide-react';

import { API_URL } from '../lib/api';
const API = API_URL;

export function ContratsPage() {
  const { data } = useQuery({
    queryKey: ['contrats'],
    queryFn: () => axios.get(`${API}/contrats`).then(r => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Contrats</h1>
      <div className="grid gap-4">
        {data?.map((c: any) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText size={24} className="text-primary" />
              <div>
                <p className="font-semibold">{c.type} - {c.montantLocation.toLocaleString()} Ar</p>
                <p className="text-sm text-gray-500">{c.chauffeur?.nom} · {c.moto?.immatriculation}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              c.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>{c.statut}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

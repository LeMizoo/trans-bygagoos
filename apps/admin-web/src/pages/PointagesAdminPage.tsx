import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Clock } from 'lucide-react';

import { API_URL } from '../lib/api';
const API = API_URL;

export function PointagesAdminPage() {
  const { data } = useQuery({
    queryKey: ['pointages'],
    queryFn: () => axios.get(`${API}/pointages`).then(r => r.data),
    refetchInterval: 15000,
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pointages</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 text-left text-sm text-gray-500">
            <th className="p-3 font-medium">Heure</th><th className="p-3 font-medium">Chauffeur</th><th className="p-3 font-medium">Type</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data?.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50 text-sm">
                <td className="p-3 flex items-center gap-2"><Clock size={14} /> {new Date(p.datePointage).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="p-3 font-medium">{p.chauffeur?.nom}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  p.type === 'ARRIVEE' ? 'bg-green-100 text-green-700' :
                  p.type === 'PAUSE' ? 'bg-yellow-100 text-yellow-700' :
                  p.type === 'REPRISE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>{p.type.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

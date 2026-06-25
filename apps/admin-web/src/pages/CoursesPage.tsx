import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { } from 'lucide-react';

import { API_URL } from '../lib/api';
const API = API_URL;

const typeLabels: Record<string, string> = {
  NORMALE: 'Course normale',
  ADY_VAROTRA: 'Ady Varotra',
  LOCATION_JOURNALIERE: 'Location journalière',
};

export function CoursesPage() {
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => axios.get(`${API}/courses`).then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: stats } = useQuery({
    queryKey: ['courses-stats'],
    queryFn: () => axios.get(`${API}/courses/stats`).then((r) => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <span className="text-sm text-gray-500">{courses?.length || 0} courses</span>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Aujourd'hui</p>
          <p className="text-2xl font-bold">{stats?.coursesAujourdhui || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">CA</p>
          <p className="text-2xl font-bold text-green-600">{(stats?.caAujourdhui || 0).toLocaleString()} Ar</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Commission</p>
          <p className="text-2xl font-bold text-primary">{(stats?.commissionAujourdhui || 0).toLocaleString()} Ar</p>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="p-3 font-medium">Heure</th>
                <th className="p-3 font-medium">Chauffeur</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Distance</th>
                <th className="p-3 font-medium text-right">Prix</th>
                <th className="p-3 font-medium text-right">Commission</th>
                <th className="p-3 font-medium text-right">Gain net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses?.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-3">{new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3 font-medium">{c.chauffeur?.nom}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{typeLabels[c.type] || c.type}</span>
                  </td>
                  <td className="p-3">{c.distance > 0 ? `${c.distance} km` : '-'}</td>
                  <td className="p-3 text-right font-medium">{c.prix.toLocaleString()} Ar</td>
                  <td className="p-3 text-right text-orange-600">{c.commission.toLocaleString()} Ar</td>
                  <td className="p-3 text-right text-green-600 font-medium">{c.gainNet.toLocaleString()} Ar</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

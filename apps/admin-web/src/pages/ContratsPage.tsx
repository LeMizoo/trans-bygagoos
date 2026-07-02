import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FileText, User, Bike, Calendar } from 'lucide-react';

const API = 'https://bygagoos-backend.onrender.com/api/v1';

export function ContratsPage() {
  const { data } = useQuery({
    queryKey: ['contrats'],
    queryFn: () => axios.get(`${API}/contrats`).then(r => r.data),
    refetchInterval: 15000,
  });

  const contrats = Array.isArray(data) ? data : [];
  const actifs = contrats.filter((c: any) => c.statut === 'ACTIF').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={24} className="text-primary" /> Contrats
        </h1>
        <span className="text-sm text-gray-500">{actifs} actifs / {contrats.length} total</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contrats.map((c: any) => (
          <div key={c.id} className={`bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-md transition-shadow ${
            c.statut === 'ACTIF' ? 'border-green-200 dark:border-green-500/20' :
            c.statut === 'TERMINE' ? 'border-gray-200' : 'border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{c.type}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                c.statut === 'ACTIF' ? 'bg-green-100 text-green-700' :
                c.statut === 'TERMINE' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
              }`}>{c.statut}</span>
            </div>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2"><User size={14} /> {c.chauffeur?.nom}</div>
              <div className="flex items-center gap-2"><Bike size={14} /> {c.moto?.immatriculation}</div>
              <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(c.dateDebut).toLocaleDateString('fr')}</div>
            </div>
            <div className="mt-3 pt-3 border-t dark:border-gray-700 text-lg font-bold text-primary">
              {c.montantLocation?.toLocaleString()} Ar
            </div>
          </div>
        ))}
        {contrats.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">
            <FileText size={48} className="mx-auto mb-3" />
            <p>Aucun contrat</p>
          </div>
        )}
      </div>
    </div>
  );
}

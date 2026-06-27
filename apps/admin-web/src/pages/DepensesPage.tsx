import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Receipt, TrendingUp } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const categories: Record<string, string> = {
  CARBURANT: '⛽ Carburant',
  ENTRETIEN: '🔧 Entretien',
  PIECE: '🔩 Pièces',
  ASSURANCE: '🛡️ Assurance',
  AUTRE: '📝 Autre',
};

export function DepensesPage() {
  const { data: depenses } = useQuery({
    queryKey: ['depenses'],
    queryFn: () => axios.get(`${API}/depenses`).then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['depenses-stats'],
    queryFn: () => axios.get(`${API}/depenses/stats`).then(r => r.data),
  });

  const liste = Array.isArray(depenses) ? depenses : [];
  const total = liste.reduce((s: number, d: any) => s + (d.montant || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Receipt size={24} className="text-primary" /> Dépenses
        </h1>
        <span className="text-sm text-gray-500">{liste.length} dépenses</span>
      </div>

      {/* Total */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 p-6 text-center">
        <p className="text-sm text-gray-500">Total dépenses</p>
        <p className="text-3xl font-bold text-red-600">{total.toLocaleString()} Ar</p>
        {stats?.parCategorie && (
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
            {stats.parCategorie.map((cat: any) => (
              <span key={cat.categorie}>{categories[cat.categorie] || cat.categorie}: <strong>{cat._sum.montant?.toLocaleString()} Ar</strong></span>
            ))}
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {liste.map((d: any) => (
          <div key={d.id} className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-lg">
                {categories[d.categorie]?.split(' ')[0] || '📝'}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{d.description}</p>
                <p className="text-xs text-gray-500">{categories[d.categorie] || d.categorie} · {new Date(d.date).toLocaleDateString('fr')}</p>
              </div>
            </div>
            <p className="font-bold text-red-500">-{d.montant?.toLocaleString()} Ar</p>
          </div>
        ))}
        {liste.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <Receipt size={48} className="mx-auto mb-3" />
            <p>Aucune dépense</p>
          </div>
        )}
      </div>
    </div>
  );
}

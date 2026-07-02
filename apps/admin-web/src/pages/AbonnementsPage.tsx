import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CreditCard } from 'lucide-react';

const API = 'https://bygagoos-backend.onrender.com/api/v1';

export function AbonnementsPage() {
  const { data: pricing } = useQuery({
    queryKey: ['parametres'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => r.data),
  });

  const { data: flottes } = useQuery({
    queryKey: ['flottes-abonnements'],
    queryFn: () => axios.get(`${API}/flottes`).then(r => r.data),
  });

  const p = (pricing && typeof pricing === 'object') ? pricing as Record<string, string> : {};
  const flottesList = Array.isArray(flottes) ? flottes : [];
  
  const parAbonnement = {
    GRATUIT: flottesList.filter((f: any) => f.abonnement === 'GRATUIT').length,
    '2_5': flottesList.filter((f: any) => f.abonnement === '2_5').length,
    '6_10': flottesList.filter((f: any) => f.abonnement === '6_10').length,
    '11_PLUS': flottesList.filter((f: any) => f.abonnement === '11_PLUS').length,
  };

  const prix2_5 = p.abonnement_2_5_prix_mensuel ?? '50000';
  const prix6_10 = p.abonnement_6_10_prix_mensuel ?? '90000';
  const prix11 = p.abonnement_11_plus_prix_mensuel ?? '150000';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><CreditCard size={24} /> Gestion des Abonnements</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Gratuit', count: parAbonnement.GRATUIT, icon: '🆓' },
          { label: '2-5 motos', count: parAbonnement['2_5'], icon: '🥈' },
          { label: '6-10 motos', count: parAbonnement['6_10'], icon: '🥇' },
          { label: '11+ motos', count: parAbonnement['11_PLUS'], icon: '💎' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-bold mt-1">{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">💰 Grille tarifaire</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Gratuit', motos: '1 moto', prixMensuel: '0 Ar', prixAnnuel: '0 Ar', color: 'border-gray-300' },
            { label: 'Standard', motos: '2-5 motos', prixMensuel: parseInt(prix2_5).toLocaleString() + ' Ar/mois', prixAnnuel: Math.round(parseInt(prix2_5) * 12 * 0.93).toLocaleString() + ' Ar/an', color: 'border-blue-300' },
            { label: 'Premium', motos: '6-10 motos', prixMensuel: parseInt(prix6_10).toLocaleString() + ' Ar/mois', prixAnnuel: Math.round(parseInt(prix6_10) * 12 * 0.93).toLocaleString() + ' Ar/an', color: 'border-purple-300' },
            { label: 'Business', motos: '11+ motos', prixMensuel: parseInt(prix11).toLocaleString() + ' Ar/mois', prixAnnuel: Math.round(parseInt(prix11) * 12 * 0.93).toLocaleString() + ' Ar/an', color: 'border-amber-300' },
          ].map((plan, i) => (
            <div key={i} className={`border-2 ${plan.color} rounded-xl p-4 text-center`}>
              <p className="font-bold text-lg">{plan.label}</p>
              <p className="text-sm text-gray-500">{plan.motos}</p>
              <p className="text-xl font-bold text-primary mt-2">{plan.prixMensuel}</p>
              <p className="text-xs text-gray-400 mt-1">{plan.label === 'Gratuit' ? 'Sans engagement' : plan.prixAnnuel + ' (-7%)'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">📋 Flottes et leurs abonnements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 text-gray-500 font-medium">Flotte</th>
                <th className="pb-2 text-gray-500 font-medium">Abonnement</th>
                <th className="pb-2 text-gray-500 font-medium">Motos</th>
                <th className="pb-2 text-gray-500 font-medium">Statut</th>
                <th className="pb-2 text-gray-500 font-medium">Fin abonnement</th>
              </tr>
            </thead>
            <tbody>
              {flottesList.map((f: any) => (
                <tr key={f.id} className="border-b">
                  <td className="py-2 font-medium">{f.nom}</td>
                  <td className="py-2">{f.abonnement === 'GRATUIT' ? '🆓 Gratuit' : f.abonnement}</td>
                  <td className="py-2">{f._count?.motos || 0}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${f.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{f.statut}</span>
                  </td>
                  <td className="py-2 text-gray-400">{f.dateFinAbonnement ? new Date(f.dateFinAbonnement).toLocaleDateString('fr') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

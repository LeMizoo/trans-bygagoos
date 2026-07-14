/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CreditCard, Send, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function AbonnementsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [msg, setMsg] = useState('');
  const flotteId = user?.flotteId;

  const { data: maFlotte } = useQuery({
    queryKey: ['ma-flotte', flotteId],
    queryFn: () => axios.get(`${API}/flottes/${flotteId}`).then(r => r.data),
    enabled: !!flotteId,
  });

  const demandeUpgrade = useMutation({
    mutationFn: (plan: string) => axios.post(`${API}/flottes/${flotteId}/demander-upgrade`, { plan }),
    onSuccess: () => { setMsg('✅ Demande envoyée ! L\'administrateur va examiner votre demande.'); qc.invalidateQueries({ queryKey: ['ma-flotte'] }); },
    onError: (err: any) => { if (err?.response?.status === 500) { setMsg('❌ Session expirée. Veuillez vous <a href="/login">reconnecter</a>.'); } else { setMsg('❌ ' + (err?.response?.data?.message || 'Erreur')); } },
  });

  const plans = [
    { abo: 'GRATUIT', label: '🆓 Gratuit', desc: '1 véhicule', prix: '0 Ar/mois' },
    { abo: '2_5', label: '🥈 Standard', desc: '2-5 véhicules', prix: '50 000 Ar/mois' },
    { abo: '6_10', label: '🥇 Premium', desc: '6-10 véhicules', prix: '90 000 Ar/mois' },
    { abo: '11_PLUS', label: '💎 Business', desc: '11+ véhicules', prix: '150 000 Ar/mois' },
  ];

  const planActuel = maFlotte?.abonnement || 'GRATUIT';
  const demandeEnCours = maFlotte?.demandeUpgrade === 'EN_ATTENTE';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard size={24} /> Mon Abonnement</h1>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

      {/* Plan actuel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-4">📋 Plan actuel</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
            {planActuel === 'GRATUIT' ? '🆓' : planActuel === '2_5' ? '🥈' : planActuel === '6_10' ? '🥇' : '💎'}
          </div>
          <div>
            <p className="text-xl font-bold">{plans.find(p => p.abo === planActuel)?.label || planActuel}</p>
            <p className="text-gray-500">{plans.find(p => p.abo === planActuel)?.desc}</p>
            {demandeEnCours && <p className="text-yellow-600 text-sm flex items-center gap-1 mt-1"><Clock size={14} /> Demande d'upgrade en attente</p>}
          </div>
        </div>
      </div>

      {/* Plans disponibles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-4">🚀 Changer de plan</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {plans.map(plan => (
            <div key={plan.abo} className={`border-2 rounded-xl p-4 text-center ${plan.abo === planActuel ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
              <div className="text-2xl mb-2">{plan.label.split(' ')[0]}</div>
              <p className="font-bold">{plan.label.split(' ')[1]}</p>
              <p className="text-sm text-gray-500">{plan.desc}</p>
              <p className="text-lg font-bold text-primary mt-2">{plan.prix}</p>
              {plan.abo === planActuel ? (
                <span className="inline-block mt-3 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm"><CheckCircle size={14} className="inline" /> Actuel</span>
              ) : demandeEnCours ? (
                <button disabled className="mt-3 w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed">En attente</button>
              ) : (
                <button onClick={() => { if (confirm(`Demander le plan ${plan.label} ?`)) demandeUpgrade.mutate(plan.abo); }}
                  className="mt-3 w-full px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 flex items-center justify-center gap-1">
                  <Send size={14} /> Demander
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

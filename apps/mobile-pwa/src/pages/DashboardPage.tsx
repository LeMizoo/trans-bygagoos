import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bike, MapPin, TrendingUp, DollarSign, Clock, Play, Pause, StopCircle } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
function getToken() { return localStorage.getItem('chauffeur-token'); }
function getChauffeur() { return JSON.parse(localStorage.getItem('chauffeur') || '{}'); }

export function DashboardPage() {
  const chauffeur = getChauffeur();
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [periode, setPeriode] = useState<'aujourdhui' | 'semaine' | 'mois'>('aujourdhui');

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', chauffeur?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${chauffeur?.id}/dashboard`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.data),
    enabled: !!chauffeur?.id,
    refetchInterval: 10000,
  });

  const pointer = useMutation({
    mutationFn: (type: string) => axios.post(`${API}/pointages`, {
      chauffeurId: chauffeur?.id, type
    }, { headers: { Authorization: `Bearer ${getToken()}` } }),
    onSuccess: (_, type) => {
      const labels: Record<string, string> = {
        ARRIVEE: 'Départ enregistré ! Bonne journée 🏍️',
        PAUSE: 'Pause enregistrée',
        FIN_SERVICE: 'Arrêt enregistré. À demain !',
      };
      setMsg(labels[type] || '');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setMsg(''), 3000);
    },
  });

  const stats = dashboard?.[periode] || { count: 0, prix: 0, commission: 0, gainNet: 0 };

  return (
    <div style={{ padding: '12px 16px' }}>
      {/* Message nouvelle journée */}
      {dashboard?.messageStatus && (
        <div style={{ padding: 12, borderRadius: 12, marginBottom: 12, textAlign: 'center', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', fontSize: 13 }}>
          {dashboard.messageStatus}
        </div>
      )}

      {msg && (
        <div style={{ padding: 10, borderRadius: 10, marginBottom: 12, textAlign: 'center', background: 'rgba(34,197,94,0.2)', color: '#86efac', fontSize: 13 }}>
          {msg}
        </div>
      )}

      {/* Boutons Départ/Pause/Arrêt */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => pointer.mutate('ARRIVEE')} 
          style={{ flex: 1, padding: '12px', background: '#22c55e', border: 'none', borderRadius: 14, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Play size={16} /> Départ
        </button>
        <button onClick={() => pointer.mutate('PAUSE')}
          style={{ flex: 1, padding: '12px', background: '#eab308', border: 'none', borderRadius: 14, color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Pause size={16} /> Pause
        </button>
        <button onClick={() => setShowConfirm(true)}
          style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: 14, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <StopCircle size={16} /> Arrêt
        </button>
      </div>

      {/* Solde */}
      <div style={{ padding: 20, borderRadius: 18, background: 'linear-gradient(135deg, #e94560, #c23152)', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>SOLDE ACTUEL</div>
        <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4 }}>{dashboard?.solde?.toLocaleString() || 0} Ar</div>
      </div>

      {/* Période */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {(['aujourdhui', 'semaine', 'mois'] as const).map((p) => (
          <button key={p} onClick={() => setPeriode(p)}
            style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: periode === p ? '#e94560' : '#1e293b', color: periode === p ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
            {p === 'aujourdhui' ? "Aujourd'hui" : p}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 16 }}>
          <MapPin size={20} color="#3b82f6" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Courses</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.count}</div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 16 }}>
          <TrendingUp size={20} color="#eab308" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Commission</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#eab308' }}>{stats.commission.toLocaleString()} Ar</div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 16 }}>
          <DollarSign size={20} color="#22c55e" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 11, color: '#94a3b8' }}>CA</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{stats.prix.toLocaleString()} Ar</div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 16 }}>
          <Clock size={20} color="#8b5cf6" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Gain net</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#8b5cf6' }}>{stats.gainNet.toLocaleString()} Ar</div>
        </div>
      </div>

      {/* Moto */}
      <div style={{ padding: 14, background: '#1e293b', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Bike size={28} color="#e94560" />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{dashboard?.moto?.marque} {dashboard?.moto?.modele}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{dashboard?.moto?.immatriculation} · {dashboard?.moto?.kmActuel?.toLocaleString()} km</div>
        </div>
      </div>

      {/* Modal Arrêt */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div style={{ background: '#1e293b', borderRadius: 20, padding: 24, maxWidth: 320, width: '100%', textAlign: 'center' }}>
            <StopCircle size={48} color="#ef4444" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Terminer la journée ?</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Vous ne pourrez plus enregistrer de courses aujourd'hui sans l'autorisation de l'administrateur.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: 12, background: '#334155', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { pointer.mutate('FIN_SERVICE'); setShowConfirm(false); }}
                style={{ flex: 1, padding: 12, background: '#ef4444', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

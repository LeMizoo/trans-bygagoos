import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Play, Pause, RotateCcw, StopCircle } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function PointagePage() {
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState('');

  const pointer = useMutation({
    mutationFn: async (type: string) => {
      const chauffeur = JSON.parse(localStorage.getItem('chauffeur') || '{}');
      const token = localStorage.getItem('chauffeur-token');
      const res = await axios.post(`${API}/pointages`, 
        { chauffeurId: chauffeur.id, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: (_, type) => {
      const labels: Record<string, string> = {
        ARRIVEE: 'Départ enregistré !',
        PAUSE: 'Pause enregistrée',
        REPRISE: 'Reprise enregistrée',
        FIN_SERVICE: 'Fin de service enregistrée',
      };
      setMsg(labels[type] || '');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setMsg(''), 2000);
    },
  });

  const actions = [
    { type: 'ARRIVEE', label: 'Départ', icon: Play, color: '#22c55e' },
    { type: 'PAUSE', label: 'Pause', icon: Pause, color: '#eab308' },
    { type: 'REPRISE', label: 'Reprise', icon: RotateCcw, color: '#3b82f6' },
    { type: 'FIN_SERVICE', label: 'Fin service', icon: StopCircle, color: '#ef4444' },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Pointage</h1>
      {msg && (
        <div style={{ padding: 12, borderRadius: 10, marginBottom: 16, textAlign: 'center', background: 'rgba(34,197,94,0.2)', color: '#86efac', fontSize: 13 }}>
          {msg}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {actions.map((a) => (
          <button key={a.type} onClick={() => pointer.mutate(a.type)} disabled={pointer.isPending}
            style={{ padding: 24, background: a.color, border: 'none', borderRadius: 16, color: a.type === 'PAUSE' ? '#000' : '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: pointer.isPending ? 0.7 : 1 }}>
            <a.icon size={28} /> {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

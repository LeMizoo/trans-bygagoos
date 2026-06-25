import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API = 'http://localhost:3000/api/v1';

export function PointagePage() {
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
      setMsg(`${type.replace('_', ' ')} enregistré !`);
      setTimeout(() => setMsg(''), 2000);
    },
    onError: (err: any) => {
      setMsg('Erreur: ' + (err.response?.data?.message || err.message));
    },
  });

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', padding: 20 }}>
      <a href="/dashboard" style={{ color: '#999', textDecoration: 'none', display: 'block', marginBottom: 20 }}>← Retour</a>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Pointage</h1>
      
      {msg ? (
        <div style={{ 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16, 
          background: msg.includes('Erreur') ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)',
          color: msg.includes('Erreur') ? '#f99' : '#9f9'
        }}>
          {msg}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={() => pointer.mutate('ARRIVEE')} style={{ padding: 24, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
          ▶ Arrivée
        </button>
        <button onClick={() => pointer.mutate('PAUSE')} style={{ padding: 24, background: '#eab308', color: '#000', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
          ⏸ Pause
        </button>
        <button onClick={() => pointer.mutate('REPRISE')} style={{ padding: 24, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
          🔄 Reprise
        </button>
        <button onClick={() => pointer.mutate('FIN_SERVICE')} style={{ padding: 24, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
          ⏹ Fin service
        </button>
      </div>
    </div>
  );
}

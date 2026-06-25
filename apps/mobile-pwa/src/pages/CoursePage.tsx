import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, DollarSign, Bike, Wifi, WifiOff } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
function getToken() { return localStorage.getItem('chauffeur-token'); }
function getChauffeur() { return JSON.parse(localStorage.getItem('chauffeur') || '{}'); }
function isOnline() { return navigator.onLine; }

export function CoursePage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState('NORMALE');
  const [distance, setDistance] = useState('');
  const [prix, setPrix] = useState('');
  const [msg, setMsg] = useState('');
  const online = isOnline();

  const createCourse = useMutation({
    mutationFn: async (data: any) => {
      const token = getToken();
      const res = await axios.post(`${API}/courses`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: (response) => {
      setMsg(`Course créée : ${response.prix.toLocaleString()} Ar`);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDistance('');
      setPrix('');
      setTimeout(() => setMsg(''), 3000);
    },
    onError: (err: any) => {
      setMsg('Erreur: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chauffeur = getChauffeur();
    createCourse.mutate({
      chauffeurId: chauffeur.id,
      motoId: chauffeur.moto?.id,
      type,
      distance: type === 'NORMALE' ? parseFloat(distance) : 0,
      prix: type !== 'NORMALE' ? parseFloat(prix) : 0,
    });
  };

  const types = [
    { value: 'NORMALE', label: 'Course\nnormale', icon: MapPin },
    { value: 'ADY_VAROTRA', label: 'Ady\nVarotra', icon: DollarSign },
    { value: 'LOCATION_JOURNALIERE', label: 'Location\njour', icon: Bike },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Nouvelle course</h1>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: online ? '#22c55e' : '#ef4444' }}>
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          {online ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>

      {msg && (
        <div style={{ padding: 12, borderRadius: 10, marginBottom: 16, textAlign: 'center', background: msg.includes('Erreur') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: msg.includes('Erreur') ? '#fca5a5' : '#86efac', fontSize: 13 }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {types.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)}
            style={{ padding: '14px 8px', borderRadius: 14, border: 'none', background: type === t.value ? '#e94560' : '#1e293b', color: type === t.value ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'pre-line', textAlign: 'center' }}>
            <t.icon size={20} style={{ display: 'block', margin: '0 auto 4px' }} />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {type === 'NORMALE' ? (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Distance (km)</label>
            <input type="number" value={distance} onChange={e => setDistance(e.target.value)}
              style={{ width: '100%', padding: 14, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 18, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
              placeholder="5" step="0.1" required />
            {distance && <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 8 }}>Prix estimé : {(2000 + parseFloat(distance) * 500).toLocaleString()} Ar</p>}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Montant (Ar)</label>
            <input type="number" value={prix} onChange={e => setPrix(e.target.value)}
              style={{ width: '100%', padding: 14, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 18, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
              placeholder="10000" required />
          </div>
        )}
        <button type="submit" disabled={createCourse.isPending}
          style={{ width: '100%', padding: 16, background: '#e94560', border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', opacity: createCourse.isPending ? 0.7 : 1 }}>
          {createCourse.isPending ? 'Enregistrement...' : 'Valider la course'}
        </button>
      </form>
    </div>
  );
}

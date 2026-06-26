import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const token = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');

export function StatsPage() {
  const c = chauffeur();
  const { data: dash } = useQuery({
    queryKey: ['dashboard', c?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${c?.id}/dashboard`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.data),
    enabled: !!c?.id,
  });
  const Card = ({ titre, data }: any) => (
    <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid #2a2a2a' }}>
      <div style={{ color: '#DAA520', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{titre}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 'bold', color: '#DAA520' }}>{data.count}</div><div style={{ fontSize: 8, color: '#888' }}>Courses</div></div>
        <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 'bold', color: '#DAA520' }}>{data.prix.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>CA</div></div>
        <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 'bold', color: '#eab308' }}>{data.commission.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>Commission</div></div>
        <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 'bold', color: data.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{data.gainNet.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>Gain net</div></div>
      </div>
    </div>
  );
  const s = (p: string) => dash?.[p] || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ color: '#DAA520', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📊 Statistiques</h1>
      <Card titre="📅 Aujourd'hui" data={s('aujourdhui')} />
      <Card titre="📆 Cette semaine" data={s('semaine')} />
      <Card titre="🗓️ Ce mois" data={s('mois')} />
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a, #DAA52022)', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #DAA520' }}>
        <div style={{ fontSize: 10, color: '#DAA520', letterSpacing: 2 }}>SOLDE ACTUEL</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#DAA520' }}>{dash?.solde?.toLocaleString() || 0} Ar</div>
      </div>
    </div>
  );
}

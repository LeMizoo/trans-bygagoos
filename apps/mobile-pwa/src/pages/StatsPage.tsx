import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');

export function StatsPage() {
  const c = chauffeur();
  const { data: dash } = useQuery({
    queryKey: ['dashboard', c?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${c?.id}/dashboard`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data),
    enabled: !!c?.id,
  });

  const s = (p: string) => dash?.[p] || { count: 0, prix: 0, commission: 0, gainNet: 0 };

  const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: '#888' }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value.toLocaleString()} Ar</span>
      </div>
      <div style={{ height: 8, background: '#252525', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  );

  const maxCA = Math.max(s('aujourdhui').prix, s('semaine').prix, s('mois').prix, 1);

  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ color: '#DAA520', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📊 Statistiques</h1>

      {/* Barres CA */}
      <div className="card">
        <div className="card-title">💰 Chiffre d'affaires</div>
        <Bar label="Aujourd'hui" value={s('aujourdhui').prix} max={maxCA} color="#DAA520" />
        <Bar label="Cette semaine" value={s('semaine').prix} max={maxCA} color="#3b82f6" />
        <Bar label="Ce mois" value={s('mois').prix} max={maxCA} color="#10b981" />
      </div>

      {/* Stats détaillées */}
      <div className="card">
        <div className="card-title">📅 Aujourd'hui</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{s('aujourdhui').count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{s('aujourdhui').prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: '#eab308' }}>{s('aujourdhui').commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: s('aujourdhui').gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{s('aujourdhui').gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      {/* Performance */}
      <div className="card">
        <div className="card-title">📈 Performance</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: '#888' }}>Courses/jour</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#DAA520' }}>
              {dash?.aujourdhui?.count ? (dash.aujourdhui.count).toFixed(0) : '0'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#888' }}>CA moyen</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#3b82f6' }}>
              {dash?.aujourdhui?.count > 0 ? Math.round(dash.aujourdhui.prix / dash.aujourdhui.count).toLocaleString() : 0} Ar
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#888' }}>Km totaux</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981' }}>
              {dash?.aujourdhui?.count || 0} courses
            </div>
          </div>
        </div>
      </div>

      {/* Solde */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1a1a1a, #DAA52022)', border: '1px solid #DAA520', textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 11, color: '#DAA520', letterSpacing: 2 }}>SOLDE ACTUEL</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#DAA520' }}>{dash?.solde?.toLocaleString() || 0} Ar</div>
      </div>
    </div>
  );
}

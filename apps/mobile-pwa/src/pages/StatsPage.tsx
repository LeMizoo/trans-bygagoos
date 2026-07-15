import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../stores/authStore';
import apiClient from '../api/client';

export default function StatsPage() {
  const { chauffeur, moto } = useAuth();

  const { data: dash } = useQuery({
    queryKey: ['dashboard', chauffeur?.id],
    queryFn: () => apiClient.get(`/chauffeurs/${chauffeur?.id}/dashboard`).then(r => r.data),
    enabled: !!chauffeur?.id,
  });

  const { data: dep } = useQuery({
    queryKey: ['depenses-stats', moto?.id],
    queryFn: () => apiClient.get(`/depenses?motoId=${moto?.id}`).then(r => r.data).catch(() => ({ items: [] })),
    enabled: !!moto?.id,
  });

  const s = (p: string) => ({ count: 0, prix: 0, commission: 0, gainNet: 0, ...(dash?.[p] ?? {}) });
  const items = dep?.items || [];
  const now = new Date();

  const debutJour = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const debutSemaine = new Date(now);
  debutSemaine.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  debutSemaine.setHours(0, 0, 0, 0);
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

  const dp = (depuis: Date) =>
    items.filter((d: any) => new Date(d.date) >= depuis).reduce((sum: number, d: any) => sum + d.montant, 0);

  const periodes = [
    { k: 'aujourdhui', t: "📅 Aujourd'hui", dep: dp(debutJour) },
    { k: 'semaine', t: '📆 Cette semaine', dep: dp(debutSemaine) },
    { k: 'mois', t: '🗓️ Ce mois', dep: dp(debutMois) },
  ];

  return (
    <div>
      {periodes.map(p => (
        <div className="card" key={p.k}>
          <div className="card-title">{p.t}</div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{s(p.k).count}</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#10b981' }}>{(s(p.k).prix || 0).toLocaleString()} Ar</div>
              <div className="stat-label">CA brut</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#ef4444' }}>-{p.dep.toLocaleString()} Ar</div>
              <div className="stat-label">Dépenses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#f59e0b' }}>-{(s(p.k).commission || 0).toLocaleString()} Ar</div>
              <div className="stat-label">Commission</div>
            </div>
          </div>
          <div style={{
            marginTop: 10, padding: 10, background: '#252525', borderRadius: 10,
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 12, color: '#888' }}>Gain net</span>
            <span style={{
              fontSize: 18, fontWeight: 800,
              color: (s(p.k).gainNet || 0) - p.dep >= 0 ? '#10b981' : '#ef4444'
            }}>
              {((s(p.k).gainNet || 0) - p.dep).toLocaleString()} Ar
            </span>
          </div>
        </div>
      ))}

      <div className="card" style={{
        background: 'linear-gradient(135deg, #1a1a1a, #DAA52022)',
        border: '1px solid #DAA520', textAlign: 'center', padding: 20
      }}>
        <div style={{ fontSize: 11, color: '#DAA520', letterSpacing: 2 }}>SOLDE ACTUEL</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#DAA520' }}>
          {(dash?.solde || chauffeur?.solde || 0).toLocaleString()} Ar
        </div>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');
const moto = () => JSON.parse(localStorage.getItem('moto') || 'null') || chauffeur()?.moto;

const catLabels: Record<string, string> = {
  CARBURANT: '⛽ Carburant',
  ENTRETIEN: '🔧 Entretien',
  PIECE: '🔩 Pièces',
  ASSURANCE: '🛡️ Assurance',
  PNEU: '🛞 Pneu',
  REPARATION: '🔨 Réparation',
  AUTRE: '📝 Autre',
};

export default function StatsPage() {
  const c = chauffeur();
  const m = moto();

  const { data: dash } = useQuery({
    queryKey: ['dashboard', c?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${c?.id}/dashboard`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data),
    enabled: !!c?.id,
  });

  const { data: depensesStats } = useQuery({
    queryKey: ['depenses-chauffeur-stats', m?.id],
    queryFn: () => axios.get(`${API}/depenses?motoId=${m?.id}`).then(r => r.data).catch(() => ({ items: [] })),
    enabled: !!m?.id,
  });

  const { data: statsMoto } = useQuery({
    queryKey: ['moto-stats-resume', m?.id],
    queryFn: () => axios.get(`${API}/motos/${m?.id}/stats`).then(r => r.data).catch(() => null),
    enabled: !!m?.id,
  });

  const s = (p: string) => ({ count: 0, prix: 0, commission: 0, gainNet: 0, ...(dash?.[p] ?? {}) });
  const depenses = Array.isArray(depensesStats?.items) ? depensesStats.items : [];

  // Totaux dépenses par période
  const now = new Date();
  const debutJour = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const debutSemaine = new Date(now);
  debutSemaine.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  debutSemaine.setHours(0, 0, 0, 0);
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

  const depensesJour = depenses.filter((d: any) => new Date(d.date) >= debutJour).reduce((sum: number, d: any) => sum + d.montant, 0);
  const depensesSemaine = depenses.filter((d: any) => new Date(d.date) >= debutSemaine).reduce((sum: number, d: any) => sum + d.montant, 0);
  const depensesMois = depenses.filter((d: any) => new Date(d.date) >= debutMois).reduce((sum: number, d: any) => sum + d.montant, 0);

  // Dépenses par catégorie
  const depensesByCat: Record<string, number> = {};
  depenses.forEach((d: any) => {
    depensesByCat[d.categorie] = (depensesByCat[d.categorie] || 0) + d.montant;
  });

  const periodes = [
    {
      key: 'aujourdhui',
      titre: "📅 Aujourd'hui",
      stats: s('aujourdhui'),
      depenses: depensesJour,
    },
    {
      key: 'semaine',
      titre: '📆 Cette semaine',
      stats: s('semaine'),
      depenses: depensesSemaine,
    },
    {
      key: 'mois',
      titre: '🗓️ Ce mois',
      stats: s('mois'),
      depenses: depensesMois,
    },
  ];

  return (
    <div>
      {/* Cartes par période avec dépenses intégrées */}
      {periodes.map(p => (
        <div className="card" key={p.key}>
          <div className="card-title">{p.titre}</div>

          {/* Stats courses */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{p.stats.count}</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#10b981' }}>
                {(p.stats.prix || 0).toLocaleString()} Ar
              </div>
              <div className="stat-label">CA brut</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#ef4444' }}>
                -{p.depenses.toLocaleString()} Ar
              </div>
              <div className="stat-label">Dépenses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                -{(p.stats.commission || 0).toLocaleString()} Ar
              </div>
              <div className="stat-label">Commission</div>
            </div>
          </div>

          {/* Barre de résumé */}
          <div style={{
            marginTop: 10,
            padding: 10,
            background: '#252525',
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: '#888' }}>Gain net</span>
            <span style={{
              fontSize: 18,
              fontWeight: 800,
              color: (p.stats.gainNet || 0) - p.depenses >= 0 ? '#10b981' : '#ef4444',
            }}>
              {((p.stats.gainNet || 0) - p.depenses).toLocaleString()} Ar
            </span>
          </div>
        </div>
      ))}

      {/* Dépenses par catégorie */}
      {Object.keys(depensesByCat).length > 0 && (
        <div className="card">
          <div className="card-title">🔧 Dépenses par catégorie</div>
          {Object.entries(depensesByCat).map(([cat, montant]) => (
            <div key={cat} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #333',
            }}>
              <span style={{ fontSize: 13 }}>{catLabels[cat] || cat}</span>
              <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>
                -{montant.toLocaleString()} Ar
              </span>
            </div>
          ))}
          <div style={{
            marginTop: 10,
            padding: 10,
            background: 'rgba(239,68,68,0.1)',
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: '#f87171' }}>Total dépenses</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
              -{Object.values(depensesByCat).reduce((a, b) => a + b, 0).toLocaleString()} Ar
            </span>
          </div>
        </div>
      )}

      {/* Stats moto */}
      {statsMoto && (
        <div className="card">
          <div className="card-title">🏍️ Ma moto : {m?.immatriculation}</div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#10b981' }}>
                {statsMoto.stats?.totalCA?.toLocaleString()} Ar
              </div>
              <div className="stat-label">CA total moto</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#ef4444' }}>
                -{statsMoto.stats?.totalDepenses?.toLocaleString()} Ar
              </div>
              <div className="stat-label">Dépenses moto</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{statsMoto.stats?.totalCourses || 0}</div>
              <div className="stat-label">Total courses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: statsMoto.stats?.gainNet >= 0 ? '#10b981' : '#ef4444' }}>
                {statsMoto.stats?.gainNet?.toLocaleString()} Ar
              </div>
              <div className="stat-label">Gain net moto</div>
            </div>
          </div>
        </div>
      )}

      {/* Solde actuel */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1a1a1a, #DAA52022)',
        border: '1px solid #DAA520',
        textAlign: 'center',
        padding: 20,
      }}>
        <div style={{ fontSize: 11, color: '#DAA520', letterSpacing: 2 }}>SOLDE ACTUEL</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#DAA520' }}>
          {((dash?.solde || c?.solde) || 0).toLocaleString()} Ar
        </div>
        <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
          CA net - commissions - dépenses
        </div>
      </div>
    </div>
  );
}

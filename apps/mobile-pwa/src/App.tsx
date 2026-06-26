import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');
const moto = () => JSON.parse(localStorage.getItem('moto') || 'null') || chauffeur()?.moto;

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const [page, setPage] = useState<'login' | 'accueil' | 'courses' | 'versements' | 'stats' | 'profil'>(
    tk() ? 'accueil' : 'login'
  );

  if (page === 'login') return <LoginPage onLogin={() => setPage('accueil')} />;

  return (
    <>
      <Header onLogout={() => { localStorage.clear(); setPage('login'); }} />
      <div className="main-content">
        {page === 'accueil' && <DashboardPage />}
        {page === 'courses' && <CoursesPage />}
        {page === 'versements' && <VersementsPage />}
        {page === 'stats' && <StatsPage />}
        {page === 'profil' && <ProfilPage onLogout={() => { localStorage.clear(); setPage('login'); }} />}
      </div>
      <BottomNav current={page} onChange={setPage} />
    </>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code || code.length < 3) { setError('Code requis'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/chauffeur/code`, { code: code.toUpperCase() });
      localStorage.setItem('chauffeur-token', data.accessToken);
      localStorage.setItem('chauffeur', JSON.stringify(data.chauffeur));
      if (data.chauffeur?.moto) localStorage.setItem('moto', JSON.stringify(data.chauffeur.moto));
      onLogin();
    } catch (err: any) {
      setError('Code introuvable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)', borderBottom: '1px solid #DAA520', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/assets/logo/b-trans.png" alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        <div><h1 style={{ color: '#DAA520', fontSize: 16, margin: 0 }}>Trans ByGagoos</h1><p style={{ color: '#888', fontSize: 11, margin: 0 }}>Application Chauffeur</p></div>
      </div>
      <div style={{ width: '100%', maxWidth: 380, marginTop: 60 }}>
        <div className="card">
          <div className="card-title">🔑 Connexion</div>
          {error && <div style={{ color: '#e74c3c', marginBottom: 12, fontSize: 12, textAlign: 'center', background: 'rgba(231,76,60,0.1)', padding: 8, borderRadius: 8 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>CODE</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={6} autoFocus
                style={{ textAlign: 'center', fontSize: 26, fontWeight: 'bold', letterSpacing: 6, color: '#DAA520', border: '2px solid #DAA520' }} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Header({ onLogout }: { onLogout: () => void }) {
  const c = chauffeur();
  const m = moto();
  const { data: dash } = useQuery({
    queryKey: ['dashboard', c?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${c?.id}/dashboard`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data),
    enabled: !!c?.id, refetchInterval: 10000,
  });
  const statutInfo: Record<string, any> = {
    EN_SERVICE: { class: 'presence-present', icon: '🟢', label: 'En service' },
    EN_PAUSE: { class: 'presence-pause', icon: '🟠', label: 'En pause' },
    HORS_SERVICE: { class: 'presence-absent', icon: '🔴', label: 'Hors service' },
  };
  const s = statutInfo[c?.statut] || statutInfo.HORS_SERVICE;
  return (
    <div className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-logo"><img src="/assets/logo/b-trans.png" alt="Logo" /></div>
          <div className="header-info">
            <h1>{c?.nom || 'Chauffeur'}</h1>
            <p>
              <span className={`presence-badge ${s.class}`}>{s.icon} {s.label}</span>
              <span className={`moto-badge ${!m ? 'sans-moto' : ''}`}>🏍️ {m?.immatriculation || 'Pas de moto'}</span>
              <span>🔑 {c?.codeAcces}</span>
            </p>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={onLogout} style={{ background: 'rgba(231,76,60,0.2)' }}>🚪</button>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const queryClient = useQueryClient();
  const c = chauffeur();
  const m = moto();
  const [msg, setMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [typeCourse, setTypeCourse] = useState('NORMALE');
  const [kmDepart, setKmDepart] = useState('');
  const [kmArrivee, setKmArrivee] = useState('');
  const [montant, setMontant] = useState('');

  const { data: dash } = useQuery({
    queryKey: ['dashboard', c?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${c?.id}/dashboard`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data),
    enabled: !!c?.id, refetchInterval: 10000,
  });

  const pointer = useMutation({
    mutationFn: (type: string) => axios.post(`${API}/pointages`, { chauffeurId: c?.id, type }, { headers: { Authorization: `Bearer ${tk()}` } }),
    onSuccess: (_, type) => {
      const labels: Record<string, string> = { ARRIVEE: '✅ Service débuté !', PAUSE: '⏸️ Pause', REPRISE: '🔄 Reprise', FIN_SERVICE: '🏁 Service terminé' };
      setMsg(labels[type] || '✅ OK');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setMsg(''), 3000);
    },
  });

  const createCourse = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/courses`, data, { headers: { Authorization: `Bearer ${tk()}` } }),
    onSuccess: () => { setMsg('✅ Course enregistrée'); setKmDepart(''); setKmArrivee(''); setMontant(''); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); },
  });

  const handleCourse = () => {
    if (typeCourse === 'NORMALE') {
      const d = parseFloat(kmArrivee) - parseFloat(kmDepart);
      if (d <= 0) { setMsg('⚠️ Km arrivée > Km départ'); return; }
      createCourse.mutate({ chauffeurId: c?.id, motoId: m?.id, type: 'NORMALE', distance: d });
    } else {
      if (!montant) { setMsg('⚠️ Entrez un montant'); return; }
      createCourse.mutate({ chauffeurId: c?.id, motoId: m?.id, type: typeCourse, prix: parseFloat(montant) });
    }
  };

  const distance = kmDepart && kmArrivee ? Math.max(0, parseFloat(kmArrivee) - parseFloat(kmDepart)) : 0;
  const prixEstime = distance > 0 ? 2000 + distance * 500 : 0;
  const stats = dash?.aujourdhui || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  const semaine = dash?.semaine || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  const mois = dash?.mois || { count: 0, prix: 0, commission: 0, gainNet: 0 };

  return (
    <div>
      {msg && <div className={`floating-alert ${msg.includes('✅') ? 'success' : 'warning'}`}>{msg}</div>}
      {dash?.messageStatus && <div style={{ background: 'rgba(52,152,219,0.15)', borderLeft: '3px solid #3498db', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#3498db' }}>{dash.messageStatus}</div>}
      
      <div className="status-buttons">
        <button onClick={() => pointer.mutate('ARRIVEE')} className="status-btn debut">▶️ Début</button>
        <button onClick={() => pointer.mutate(c?.statut === 'EN_PAUSE' ? 'REPRISE' : 'PAUSE')} className="status-btn standby">
          {c?.statut === 'EN_PAUSE' ? '▶️ Reprendre' : '⏸️ Standby'}
        </button>
        <button onClick={() => setShowConfirm(true)} className="status-btn fin">⏹️ Fin</button>
      </div>

      <div className="card">
        <div className="card-title">📅 Aujourd'hui</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{stats.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{stats.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{stats.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: stats.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{stats.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">➕ Nouvelle course</div>
        <div className="form-group">
          <select value={typeCourse} onChange={e => setTypeCourse(e.target.value)}>
            <option value="NORMALE">🚖 Course normale</option>
            <option value="ADY_VAROTRA">🛺 Ady Varotra</option>
            <option value="LOCATION_JOURNALIERE">📅 Location journalière</option>
          </select>
        </div>
        {typeCourse === 'NORMALE' ? (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input type="number" step="0.1" value={kmDepart} onChange={e => setKmDepart(e.target.value)} placeholder="Km départ" style={{ flex: 1, padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13 }} />
              <input type="number" step="0.1" value={kmArrivee} onChange={e => setKmArrivee(e.target.value)} placeholder="Km arrivée" style={{ flex: 1, padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13 }} />
            </div>
            {distance > 0 && <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center', fontSize: 12, marginBottom: 8 }}>📏 {distance.toFixed(1)} km · 💰 {prixEstime.toLocaleString()} Ar</div>}
          </>
        ) : (
          <div className="form-group">
            <input type="number" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Montant (Ar)" />
          </div>
        )}
        <button onClick={handleCourse} disabled={createCourse.isPending} className="btn-primary">
          {createCourse.isPending ? '⏳...' : '✅ Enregistrer'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">📆 Cette semaine</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{semaine.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{semaine.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{semaine.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: semaine.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{semaine.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📅 Ce mois</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{mois.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{mois.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{mois.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: mois.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{mois.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#DAA520', marginBottom: 12 }}>🏁 Terminer la journée ?</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Vous ne pourrez plus enregistrer de courses aujourd'hui sans l'autorisation de l'administrateur.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 12, background: '#333', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { pointer.mutate('FIN_SERVICE'); setShowConfirm(false); }} style={{ flex: 1, padding: 12, background: '#e74c3c', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursesPage() {
  const c = chauffeur();
  const { data } = useQuery({
    queryKey: ['courses', c?.id],
    queryFn: () => axios.get(`${API}/courses`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data).catch(() => []),
    enabled: !!c?.id,
  });
  const courses = Array.isArray(data) ? data : [];
  return (
    <div>
      <div className="card"><div className="card-title">📋 Mes courses</div></div>
      {courses.length === 0 ? <p style={{ color: '#888', textAlign: 'center', padding: 20 }}>Aucune course</p> :
        courses.slice(0, 50).map((course: any) => (
          <div key={course.id} style={{ background: '#252525', borderRadius: 10, padding: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <div><div style={{ fontWeight: 'bold', color: '#DAA520', fontSize: 12 }}>{course.type}</div><div style={{ fontSize: 10, color: '#888' }}>{new Date(course.createdAt).toLocaleString('fr')}</div></div>
            <div style={{ fontWeight: 'bold', color: '#DAA520' }}>{course.prix?.toLocaleString()} Ar</div>
          </div>
        ))
      }
    </div>
  );
}

function VersementsPage() {
  const c = chauffeur();
  const [montant, setMontant] = useState('');
  const { data } = useQuery({
    queryKey: ['versements', c?.id],
    queryFn: () => axios.get(`${API}/versements/chauffeur/${c?.id}`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data),
    enabled: !!c?.id,
  });
  const versements = Array.isArray(data) ? data : [];
  return (
    <div>
      <div className="card"><div className="card-title">💰 Versements</div></div>
      <div className="card">
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Montant" style={{ flex: 1, padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff' }} />
          <button onClick={() => montant && axios.post(`${API}/versements`, { chauffeurId: c?.id, montantVerse: parseFloat(montant) }, { headers: { Authorization: `Bearer ${tk()}` } }).then(() => { setMontant(''); alert('✅ Demande envoyée'); })} className="btn-primary" style={{ width: 'auto' }}>Envoyer</button>
        </div>
      </div>
      {versements.map((v: any) => (
        <div key={v.id} style={{ background: '#252525', borderRadius: 10, padding: 10, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
          <div><div style={{ fontWeight: 'bold' }}>{v.montantVerse?.toLocaleString()} Ar</div><div style={{ fontSize: 10, color: '#888' }}>{new Date(v.createdAt).toLocaleDateString('fr')}</div></div>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: v.statut === 'VALIDE' ? 'rgba(39,174,96,0.2)' : 'rgba(243,156,18,0.2)', color: v.statut === 'VALIDE' ? '#27ae60' : '#f39c12' }}>{v.statut === 'VALIDE' ? 'Validé' : 'En attente'}</span>
        </div>
      ))}
    </div>
  );
}

function StatsPage() {
  const c = chauffeur();
  const { data: dash } = useQuery({
    queryKey: ['dashboard', c?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${c?.id}/dashboard`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data),
    enabled: !!c?.id,
  });
  const s = (p: string) => dash?.[p] || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  return (
    <div>
      {['aujourdhui', 'semaine', 'mois'].map(p => (
        <div className="card" key={p}>
          <div className="card-title">{p === 'aujourdhui' ? "📅 Aujourd'hui" : p === 'semaine' ? '📆 Cette semaine' : '🗓️ Ce mois'}</div>
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-value">{s(p).count}</div><div className="stat-label">Courses</div></div>
            <div className="stat-item"><div className="stat-value">{s(p).prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
            <div className="stat-item"><div className="stat-value">{s(p).commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
            <div className="stat-item"><div className="stat-value" style={{ color: s(p).gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{s(p).gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
          </div>
        </div>
      ))}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1a1a1a, #DAA52022)', border: '1px solid #DAA520', textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 11, color: '#DAA520', letterSpacing: 2 }}>SOLDE ACTUEL</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#DAA520' }}>{dash?.solde?.toLocaleString() || 0} Ar</div>
      </div>
    </div>
  );
}

function ProfilPage({ onLogout }: { onLogout: () => void }) {
  const c = chauffeur();
  const m = moto();
  return (
    <div>
      <div className="card">
        <div className="card-title">👤 Mon profil</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#DAA520', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', color: '#000' }}>{c?.nom?.charAt(0) || '?'}</div>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>{c?.nom}</div><div style={{ fontSize: 12, color: '#888' }}>{c?.codeAcces}</div></div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}><span style={{ color: '#888' }}>📱 Téléphone</span><span>{c?.telephone || '-'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}><span style={{ color: '#888' }}>🏍️ Moto</span><span>{m?.immatriculation || 'Aucune'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}><span style={{ color: '#888' }}>💰 Solde</span><span style={{ color: '#DAA520', fontWeight: 700 }}>{c?.solde?.toLocaleString() || 0} Ar</span></div>
        </div>
      </div>
      <button onClick={onLogout} style={{ width: '100%', padding: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#f87171', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 10 }}>🚪 Déconnexion</button>
    </div>
  );
}

function BottomNav({ current, onChange }: { current: string; onChange: (p: any) => void }) {
  const tabs = [
    { key: 'accueil', label: 'Accueil', icon: '🏠' },
    { key: 'courses', label: 'Courses', icon: '📋' },
    { key: 'versements', label: 'Versements', icon: '💰' },
    { key: 'stats', label: 'Stats', icon: '📊' },
    { key: 'profil', label: 'Profil', icon: '👤' },
  ];
  return (
    <nav className="bottom-nav">
      <div className="nav-items">
        {tabs.map(t => (
          <button key={t.key} onClick={() => onChange(t.key)} className={`nav-item ${current === t.key ? 'active' : ''}`}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

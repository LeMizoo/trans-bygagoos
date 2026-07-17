import { useState, useEffect } from 'react';
import { useAuth } from '../stores/authStore';
import apiClient from '../api/client';

type Profil = 'flotte' | 'coop' | null;

export default function LoginPage() {
  const { login } = useAuth();
  const [profil, setProfil] = useState<Profil>(null);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [entiteId, setEntiteId] = useState('');
  const [entites, setEntites] = useState<any[]>([]);

  const couleur = profil === 'flotte' ? '#DAA520' : '#10b981';
  const emoji = profil === 'flotte' ? '🏍️' : '📦';

  useEffect(() => {
    if (!profil) return;
    apiClient.get('/coops').then(r => {
      const list = r.data?.items || r.data || [];
      if (Array.isArray(list)) {
        const filtered = list.filter((f: any) => {
          const nom = (f.nom || '').toLowerCase();
          if (profil === 'flotte') return nom.includes('flotte') || nom.includes('taxi');
          return nom.includes('coop') || nom.includes('express') || nom.includes('livraison');
        });
        setEntites(filtered);
        if (filtered.length === 1) setEntiteId(filtered[0].id);
      }
    }).catch(() => {});
  }, [profil]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code || code.length < 3) { setError('Code requis (3 caracteres min)'); return; }
    setLoading(true);
    try {
      const payload: any = { codeAcces: code.toUpperCase(), pin };
      if (entiteId) payload.coopId = entiteId;
      let data;
      try {
        const res = await apiClient.post('/auth/chauffeur/login', payload);
        data = res.data;
      } catch {
        const res = await apiClient.post('/auth/login', { email: code, password: pin });
        data = { accessToken: res.data.token, chauffeur: res.data.user };
      }
      login(data.accessToken || data.token, data.chauffeur || data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code ou PIN incorrect');
    } finally {
      setLoading(false);
    }
  };

  const entiteSelectionnee = entites.find((f: any) => f.id === entiteId);

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: 'system-ui, sans-serif'
    }}>
      <div className="app-header" style={{ position: 'fixed', top: 0 }}>
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <img src="/assets/logo/b-trans.png" alt="Logo" />
            </div>
            <div className="header-info">
              <h1>{entiteSelectionnee?.nom || 'ByGagoos Ride'}</h1>
              <p>{profil === 'flotte' ? '🏍️ Flotte Taxi-Moto' : profil === 'coop' ? '📦 Coop Livraison' : 'Application Chauffeur'}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 380, marginTop: 60 }}>

        {/* ÉTAPE 1 : Choix Flotte ou Coop */}
        {!profil ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-title" style={{ marginBottom: 20 }}>Je suis...</div>
            <button onClick={() => setProfil('flotte')} style={{
              width: '100%', padding: 20, marginBottom: 12,
              background: 'linear-gradient(135deg, #DAA52022, #DAA52044)',
              border: '2px solid #DAA520', borderRadius: 16,
              color: '#DAA520', fontSize: 18, fontWeight: 700, cursor: 'pointer'
            }}>
              🏍️ Chauffeur Taxi-Moto
              <div style={{ fontSize: 11, color: '#888', fontWeight: 400, marginTop: 4 }}>Flotte</div>
            </button>
            <button onClick={() => setProfil('coop')} style={{
              width: '100%', padding: 20,
              background: 'linear-gradient(135deg, #10b98122, #10b98144)',
              border: '2px solid #10b981', borderRadius: 16,
              color: '#10b981', fontSize: 18, fontWeight: 700, cursor: 'pointer'
            }}>
              📦 Livreur Coopérative
              <div style={{ fontSize: 11, color: '#888', fontWeight: 400, marginTop: 4 }}>Coop</div>
            </button>
          </div>
        ) : (
          /* ÉTAPE 2 : Login */
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>🔑 Connexion {profil === 'flotte' ? 'Flotte' : 'Coop'}</span>
              <button onClick={() => { setProfil(null); setEntites([]); setEntiteId(''); }}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18 }}>←</button>
            </div>

            {error && (
              <div style={{
                color: '#e74c3c', marginBottom: 12, fontSize: 12, textAlign: 'center',
                background: 'rgba(231,76,60,0.1)', padding: 8, borderRadius: 8
              }}>{error}</div>
            )}

            <form onSubmit={submit}>
              {entites.length > 1 && (
                <div className="form-group">
                  <select value={entiteId} onChange={e => setEntiteId(e.target.value)}
                    style={{ width: '100%', padding: 12, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13 }}>
                    <option value="">🏢 Choisir une {profil === 'flotte' ? 'flotte' : 'cooperative'}</option>
                    {entites.map((f: any) => (
                      <option key={f.id} value={f.id}>{emoji} {f.nom}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <input
                  type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="CODE" maxLength={6} autoFocus inputMode="text"
                  style={{ textAlign: 'center', fontSize: 26, fontWeight: 'bold', letterSpacing: 6, color: couleur, border: `2px solid ${couleur}`, width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 12 }}
                />
              </div>
              <div className="form-group">
                <input
                  type="password" value={pin} onChange={e => setPin(e.target.value)}
                  placeholder="PIN" maxLength={4} inputMode="numeric"
                  style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', letterSpacing: 4, color: couleur, border: `2px solid ${couleur}`, width: '100%', padding: 10, background: '#1a1a1a', borderRadius: 12 }}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ background: couleur, color: '#000' }}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

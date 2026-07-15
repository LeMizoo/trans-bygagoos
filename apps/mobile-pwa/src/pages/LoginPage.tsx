import { useState, useEffect } from 'react';
import { useAuth } from '../stores/authStore';
import apiClient from '../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [entiteId, setEntiteId] = useState('');
  const [entites, setEntites] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/coops').then(r => {
      const list = r.data?.items || r.data || [];
      if (Array.isArray(list)) {
        setEntites(list);
        if (list.length === 1) setEntiteId(list[0].id);
      }
    }).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code || code.length < 3) { setError('Code requis (3 caracteres min)'); return; }
    setLoading(true);
    try {
      const payload: any = { codeAcces: code.toUpperCase(), pin };
      if (entiteId) payload.coopId = entiteId;
      // Essayer chauffeur/login, sinon fallback sur auth/login
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
              <p>Application Chauffeur</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 380, marginTop: 60 }}>
        <div className="card">
          <div className="card-title">🔑 Connexion</div>

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
                  style={{
                    width: '100%', padding: 12, background: '#252525',
                    border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13
                  }}>
                  <option value="">🏢 Choisir une flotte</option>
                  {entites.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <input
                type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="CODE" maxLength={6} autoFocus inputMode="text"
                style={{
                  textAlign: 'center', fontSize: 26, fontWeight: 'bold',
                  letterSpacing: 6, color: '#DAA520',
                  border: '2px solid #DAA520',
                  width: '100%', padding: 12, background: '#1a1a1a', borderRadius: 12
                }}
              />
            </div>

            <div className="form-group">
              <input
                type="password" value={pin} onChange={e => setPin(e.target.value)}
                placeholder="PIN" maxLength={4} inputMode="numeric"
                style={{
                  textAlign: 'center', fontSize: 20, fontWeight: 'bold',
                  letterSpacing: 4, color: '#DAA520',
                  border: '2px solid #DAA520',
                  width: '100%', padding: 10, background: '#1a1a1a', borderRadius: 12
                }}
              />
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

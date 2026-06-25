import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function LoginPage() {
  const [code, setCode] = useState('CH001');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code || !pin) { setError('Remplissez tous les champs'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/chauffeur/login`, { codeAcces: code, pin });
      localStorage.setItem('chauffeur-token', data.accessToken);
      localStorage.setItem('chauffeur', JSON.stringify(data.chauffeur));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Code ou PIN incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <img src="/assets/logo/b-trans.png" alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 12 }} />
          <h1 style={{ color: '#DAA520', fontSize: 22, fontWeight: 700, margin: 0 }}>Trans ByGagoos</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Application Chauffeur</p>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: 14, padding: 16, border: '1px solid #2a2a2a' }}>
          <h2 style={{ color: '#DAA520', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>🔑 Connexion</h2>
          {error && <div style={{ color: '#e74c3c', marginBottom: 12, fontSize: 12, background: 'rgba(231,76,60,0.1)', padding: 8, borderRadius: 8, textAlign: 'center' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: '#DAA520', fontSize: 11, display: 'block', marginBottom: 4 }}>Code chauffeur</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="CH001" style={{ width: '100%', padding: 14, background: '#252525', border: '2px solid #DAA520', borderRadius: 10, color: '#DAA520', textAlign: 'center', fontSize: 22, fontWeight: 'bold', letterSpacing: 4, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#DAA520', fontSize: 11, display: 'block', marginBottom: 4 }}>Code PIN</label>
              <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} placeholder="****" style={{ width: '100%', padding: 14, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', textAlign: 'center', fontSize: 22, letterSpacing: 8, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: '#DAA520', color: '#000', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Connexion...' : '🔑 Se connecter'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: '#555', fontSize: 10, marginTop: 16 }}>CH001 / PIN: 1234</p>
      </div>
    </div>
  );
}

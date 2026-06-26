import { useState } from 'react';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code || code.length < 3) { setError('Veuillez entrer votre code'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/chauffeur/code`, { code: code.toUpperCase() });
      localStorage.setItem('chauffeur-token', data.accessToken);
      localStorage.setItem('chauffeur', JSON.stringify(data.chauffeur));
      if (data.chauffeur?.moto) localStorage.setItem('moto', JSON.stringify(data.chauffeur.moto));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError('Code introuvable. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <img src="/assets/logo/b-trans.png" alt="Logo" style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 16 }} />
        <h1 style={{ color: '#DAA520', fontSize: 24, fontWeight: 700, margin: 0 }}>Trans ByGagoos</h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Application Chauffeur</p>
      </div>
      <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #2a2a2a', width: '100%', maxWidth: 380 }}>
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontSize: 13, background: 'rgba(231,76,60,0.1)', padding: 10, borderRadius: 8, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <input 
              type="text" 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())} 
              placeholder="CODE" 
              maxLength={6} 
              autoFocus
              style={{ width: '100%', padding: 18, background: '#252525', border: '2px solid #DAA520', borderRadius: 12, color: '#DAA520', textAlign: 'center', fontSize: 28, fontWeight: 'bold', letterSpacing: 6, outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase' }} 
            />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: 16, background: '#2ecc71', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

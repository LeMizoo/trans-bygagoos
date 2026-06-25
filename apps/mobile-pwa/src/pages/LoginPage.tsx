import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Key } from 'lucide-react';

export function LoginPage() {
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code || code.length < 4) { setError('Code à 4 chiffres'); return; }
    if (!pin || pin.length < 4) { setError('PIN à 4 chiffres'); return; }
    setLoading(true);
    try {
      await login(code, pin);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Code ou PIN invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <img src="/assets/logo/b-trans.png" alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 12 }} />
          <h1 style={{ color: '#DAA520', fontSize: 22, fontWeight: 700 }}>Trans ByGagoos</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Application Chauffeur</p>
        </div>
        <div className="card">
          <div className="card-title">🔑 Connexion</div>
          {error && <div style={{ color: '#e74c3c', marginBottom: 12, fontSize: 12, background: 'rgba(231,76,60,0.1)', padding: 8, borderRadius: 8 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Code chauffeur</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="CH001" style={{ textAlign: 'center', fontSize: 22, letterSpacing: 6, fontWeight: 'bold', color: '#DAA520' }} />
            </div>
            <div className="form-group">
              <label>Code PIN</label>
              <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} placeholder="****" style={{ textAlign: 'center', fontSize: 22, letterSpacing: 8 }} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Key size={18} /> {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: '#555', fontSize: 10, marginTop: 16 }}>CH001 / 1234</p>
      </div>
    </div>
  );
}

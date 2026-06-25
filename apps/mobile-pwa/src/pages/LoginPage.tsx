import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Key } from 'lucide-react';

export function LoginPage() {
  const [codeAcces, setCodeAcces] = useState('CH001');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(codeAcces, pin);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Code ou PIN incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" style={{ width: 80, height: 80, margin: '0 auto 20px', objectFit: 'contain' }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Trans ByGagoos</h1>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>Espace Chauffeur</p>

        {error && <div style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="text" value={codeAcces} onChange={e => setCodeAcces(e.target.value.toUpperCase())}
            style={{ width: '100%', padding: 14, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 700, letterSpacing: 4, marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
            placeholder="CH001" required />
          <input type="password" value={pin} onChange={e => setPin(e.target.value)}
            style={{ width: '100%', padding: 14, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff', textAlign: 'center', fontSize: 18, letterSpacing: 8, marginBottom: 20, outline: 'none', boxSizing: 'border-box' }}
            placeholder="••••" maxLength={4} required />
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: 14, background: '#e94560', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Key size={18} /> {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p style={{ color: '#64748b', fontSize: 11, marginTop: 20 }}>CH001 / PIN: 1234</p>
      </div>
    </div>
  );
}

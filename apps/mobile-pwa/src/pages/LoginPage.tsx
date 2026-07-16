import { useState } from 'react';
import { useAuth } from '../stores/authStore';
import apiClient from '../api/client';

type AuthMode = 'chauffeur' | 'admin' | 'flotte' | 'coop';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('chauffeur');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [codeAcces, setCodeAcces] = useState('');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;

      switch (mode) {
        case 'chauffeur':
          response = await apiClient.post('/auth/chauffeur/login', {
            codeAcces,
            pin,
          });
          break;
        case 'admin':
        case 'flotte':
        case 'coop':
          response = await apiClient.post('/auth/login', {
            email,
            password,
          });
          break;
      }

      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'chauffeur', emoji: '🚛', label: 'Chauffeur', color: '#2ecc71' },
    { id: 'coop', emoji: '🏢', label: 'Coopérative', color: '#3498db' },
    { id: 'flotte', emoji: '🚚', label: 'Flotte', color: '#9b59b6' },
    { id: 'admin', emoji: '⚙️', label: 'Admin', color: '#e74c3c' },
  ] as const;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      paddingBottom: '90px',
    }}>
      {/* Logo / Titre */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#DAA520', fontSize: '28px', fontWeight: 'bold', marginBottom: '6px' }}>
          Trans ByGagoos
        </h1>
        <p style={{ color: '#888', fontSize: '13px' }}>
          Connectez-vous à votre espace
        </p>
      </div>

      {/* Sélecteur de rôle */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '20px',
      }}>
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => setMode(role.id)}
            style={{
              padding: '14px 10px',
              borderRadius: '14px',
              border: mode === role.id ? `2px solid ${role.color}` : '2px solid #2a2a2a',
              background: mode === role.id ? `${role.color}22` : '#1a1a1a',
              color: mode === role.id ? role.color : '#666',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{role.emoji}</span>
            {role.label}
          </button>
        ))}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '360px',
        background: '#1a1a1a',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #2a2a2a',
      }}>
        {error && (
          <div style={{
            background: 'rgba(231,76,60,0.15)',
            border: '1px solid rgba(231,76,60,0.3)',
            color: '#e74c3c',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {mode === 'chauffeur' ? (
          <>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#DAA520', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                Code d'accès
              </label>
              <input
                type="text"
                value={codeAcces}
                onChange={(e) => setCodeAcces(e.target.value)}
                placeholder="Entrez votre code"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#252525',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#DAA520', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                Code PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#252525',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#DAA520', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#252525',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#DAA520', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#252525',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#8B7500' : '#DAA520',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

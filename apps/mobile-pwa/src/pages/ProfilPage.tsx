import { useAuth } from '../stores/authStore';
import apiClient from '../api/client';

export default function ProfilPage() {
  const { chauffeur, moto, logout } = useAuth();

  const assistance = () => {
    const msg = prompt('Décrivez votre problème (10 carac min):');
    if (msg && msg.length >= 10) {
      apiClient.post('/assistance', {
        chauffeurId: chauffeur?.id,
        type: 'AUTRE',
        urgence: 'NORMALE',
        description: msg,
      }).then(() => alert('✅ Demande envoyée')).catch(() => alert('❌ Erreur'));
    } else if (msg) {
      alert('10 caractères minimum');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">👤 Mon profil</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', background: '#DAA520',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 'bold', color: '#000'
          }}>
            {chauffeur?.nom?.charAt(0) || '?'}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{chauffeur?.nom}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{chauffeur?.codeAcces}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
          <div className="profil-item">
            <span style={{ color: '#888' }}>📱 Téléphone</span>
            <span>{chauffeur?.telephone || '-'}</span>
          </div>
          <div className="profil-item">
            <span style={{ color: '#888' }}>🏍️ Moto</span>
            <span>{moto?.immatriculation || 'Aucune'}</span>
          </div>
          <div className="profil-item">
            <span style={{ color: '#888' }}>📊 Statut</span>
            <span>{chauffeur?.statut || 'HORS_SERVICE'}</span>
          </div>
          <div className="profil-item">
            <span style={{ color: '#888' }}>💰 Solde</span>
            <span style={{ color: '#DAA520', fontWeight: 700 }}>
              {chauffeur?.solde?.toLocaleString() || 0} Ar
            </span>
          </div>
        </div>
      </div>

      <button onClick={assistance} style={{
        width: '100%', padding: 14, background: 'rgba(218,165,32,0.15)',
        border: '1px solid rgba(218,165,32,0.3)', borderRadius: 12,
        color: '#DAA520', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        marginTop: 10, marginBottom: 10
      }}>
        🆘 Assistance
      </button>

      <button onClick={logout} style={{
        width: '100%', padding: 14, background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12,
        color: '#f87171', fontWeight: 600, fontSize: 14, cursor: 'pointer'
      }}>
        🚪 Déconnexion
      </button>
    </div>
  );
}

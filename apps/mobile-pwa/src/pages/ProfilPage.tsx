export function ProfilPage() {
  const chauffeur = JSON.parse(localStorage.getItem('chauffeur') || '{}');
  const moto = JSON.parse(localStorage.getItem('moto') || 'null');
  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };
  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ color: '#DAA520', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>👤 Mon profil</h1>
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid #2a2a2a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#DAA520', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', color: '#000' }}>{chauffeur?.nom?.charAt(0) || '?'}</div>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>{chauffeur?.nom || 'Chauffeur'}</div><div style={{ fontSize: 12, color: '#888' }}>{chauffeur?.codeAcces}</div></div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}><span style={{ color: '#888' }}>📱 Téléphone</span><span>{chauffeur?.telephone || '-'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}><span style={{ color: '#888' }}>🏍️ Moto</span><span>{moto?.immatriculation || 'Aucune'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}><span style={{ color: '#888' }}>💰 Solde</span><span style={{ color: '#DAA520', fontWeight: 700 }}>{chauffeur?.solde?.toLocaleString() || 0} Ar</span></div>
        </div>
      </div>
      <button onClick={handleLogout} style={{ width: '100%', padding: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#f87171', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 10 }}>🚪 Déconnexion</button>
    </div>
  );
}

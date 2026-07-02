import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://bygagoos-backend.onrender.com/api/v1';
const moto = () => JSON.parse(localStorage.getItem('moto') || 'null') || JSON.parse(localStorage.getItem('chauffeur') || '{}')?.moto;

export default function AlertesMotoPage() {
  const m = moto();

  const { data: stats } = useQuery({
    queryKey: ['moto-stats', m?.id],
    queryFn: () => axios.get(`${API}/motos/${m?.id}/stats`).then(r => r.data),
    enabled: !!m?.id,
  });

  if (!m) {
    return (
      <div className="card">
        <div className="card-title">⚠️ Alertes Moto</div>
        <p style={{ color: '#888', textAlign: 'center', padding: 20 }}>Aucune moto assignée</p>
      </div>
    );
  }

  const motoData = stats?.moto;
  const maintenant = new Date();

  const alertes = [];
  if (motoData?.finAssurance && new Date(motoData.finAssurance) < maintenant) {
    alertes.push({ icon: '🛡️', text: 'Assurance expirée', date: motoData.finAssurance, urgent: true });
  }
  if (motoData?.finVignette && new Date(motoData.finVignette) < maintenant) {
    alertes.push({ icon: '🏷️', text: 'Vignette expirée', date: motoData.finVignette, urgent: true });
  }
  if (motoData?.kmProchaineVidange && motoData?.kmActuel >= motoData.kmProchaineVidange - 500) {
    alertes.push({ icon: '🔧', text: `Vidange proche (${motoData.kmProchaineVidange - motoData.kmActuel} km restants)`, date: null, urgent: motoData.kmActuel >= motoData.kmProchaineVidange });
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">🏍️ Alertes {m.immatriculation}</div>
        <p style={{ fontSize: 11, color: '#888' }}>{motoData?.marque} {motoData?.modele}</p>
      </div>

      {alertes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <p style={{ color: '#27ae60' }}>Tout est en ordre !</p>
        </div>
      ) : (
        alertes.map((a, i) => (
          <div key={i} style={{
            background: a.urgent ? 'rgba(239,68,68,0.1)' : 'rgba(243,156,18,0.1)',
            border: `1px solid ${a.urgent ? 'rgba(239,68,68,0.3)' : 'rgba(243,156,18,0.3)'}`,
            borderRadius: 12,
            padding: 15,
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</div>
            <div style={{ fontWeight: 600, color: a.urgent ? '#ef4444' : '#f39c12', fontSize: 14 }}>{a.text}</div>
            {a.date && <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Depuis le {new Date(a.date).toLocaleDateString('fr')}</div>}
          </div>
        ))
      )}

      {/* Infos techniques */}
      {motoData && (
        <div className="card">
          <div className="card-title">📊 État actuel</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            <div style={{ padding: 8, background: '#252525', borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 10 }}>KM Actuel</div>
              <div style={{ fontWeight: 600 }}>{motoData.kmActuel?.toLocaleString()}</div>
            </div>
            <div style={{ padding: 8, background: '#252525', borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 10 }}>Prochaine Vidange</div>
              <div style={{ fontWeight: 600 }}>{motoData.kmProchaineVidange?.toLocaleString() || 'N/A'}</div>
            </div>
            <div style={{ padding: 8, background: '#252525', borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 10 }}>Assurance</div>
              <div style={{ fontWeight: 600, color: motoData.finAssurance && new Date(motoData.finAssurance) < maintenant ? '#ef4444' : '#27ae60' }}>
                {motoData.finAssurance ? new Date(motoData.finAssurance).toLocaleDateString('fr') : 'N/A'}
              </div>
            </div>
            <div style={{ padding: 8, background: '#252525', borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 10 }}>Vignette</div>
              <div style={{ fontWeight: 600, color: motoData.finVignette && new Date(motoData.finVignette) < maintenant ? '#ef4444' : '#27ae60' }}>
                {motoData.finVignette ? new Date(motoData.finVignette).toLocaleDateString('fr') : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

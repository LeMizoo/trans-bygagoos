import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface NotificationsPageProps {
  onBack: () => void;
}

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const { data } = useQuery({
    queryKey: ['notifications-all'],
    queryFn: () => apiClient.get('/notifications').then(r => r.data).catch(() => []),
    refetchInterval: 15000,
  });

  const notifs = Array.isArray(data) ? data : [];

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Retour</button>
      <div className="card">
        <div className="card-title">🔔 Toutes les notifications</div>
      </div>
      {notifs.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: 20 }}>Aucune notification</p>
      ) : (
        notifs.map((n: any) => (
          <div
            key={n.id}
            style={{
              background: '#252525', borderRadius: 10, padding: 10, marginBottom: 8,
              borderLeft: '3px solid ' + (n.lu ? '#DAA520' : '#e74c3c')
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#DAA520', fontSize: 12, marginBottom: 4 }}>{n.titre}</div>
            <div style={{ fontSize: 11, color: '#ccc', marginBottom: 4 }}>{n.message}</div>
            <div style={{ fontSize: 10, color: '#666' }}>{new Date(n.createdAt).toLocaleString('fr')}</div>
          </div>
        ))
      )}
    </div>
  );
}

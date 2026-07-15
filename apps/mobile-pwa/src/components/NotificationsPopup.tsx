import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface NotificationsPopupProps {
  onClose: () => void;
  onViewAll: () => void;
}

export default function NotificationsPopup({ onClose, onViewAll }: NotificationsPopupProps) {
  const { data } = useQuery({
    queryKey: ['notifications-popup'],
    queryFn: () => apiClient.get('/notifications').then(r => r.data).catch(() => []),
    refetchInterval: 15000,
  });

  const notifs = Array.isArray(data) ? data.slice(0, 5) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ color: '#DAA520', fontSize: 16 }}>🔔 Notifications</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' }}>×</button>
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

        {notifs.length > 0 && (
          <button onClick={onViewAll} className="btn-primary" style={{ marginTop: 8, background: '#DAA520', color: '#000' }}>
            Voir toutes les notifications
          </button>
        )}
      </div>
    </div>
  );
}

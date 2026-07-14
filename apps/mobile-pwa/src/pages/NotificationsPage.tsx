import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';

export default function NotificationsPage({ onBack }: { onBack: () => void }) {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => axios.get(`${API}/notifications`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data).catch(() => []),
    refetchInterval: 15000,
  });

  const marquerLu = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/notifications/${id}/lu`, {}, { headers: { Authorization: `Bearer ${tk()}` } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const archiver = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/notifications/${id}`, { archive: true }, { headers: { Authorization: `Bearer ${tk()}` } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const supprimer = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/notifications/${id}`, { headers: { Authorization: `Bearer ${tk()}` } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifs = Array.isArray(data) ? data : [];

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Retour</button>
      <div className="card">
        <div className="card-title">🔔 Notifications ({notifs.length})</div>
      </div>
      {notifs.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: 30 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 10 }}>🔕</span>
          Aucune notification
        </p>
      ) : (
        notifs.map((n: any) => (
          <div key={n.id} style={{
            background: '#1a1a1a',
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            borderLeft: '4px solid ' + (n.lu ? '#DAA520' : '#e74c3c'),
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 'bold', color: '#DAA520', fontSize: 13, marginBottom: 4, flex: 1 }}>
                {n.titre}
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {!n.lu && (
                  <button
                    onClick={() => marquerLu.mutate(n.id)}
                    style={{ padding: '3px 8px', fontSize: 10, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                    title="Marquer comme lu"
                  >✓</button>
                )}
                <button
                  onClick={() => archiver.mutate(n.id)}
                  style={{ padding: '3px 8px', fontSize: 10, background: '#f39c12', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                  title="Archiver"
                >📦</button>
                <button
                  onClick={() => { if (confirm('Supprimer ?')) supprimer.mutate(n.id); }}
                  style={{ padding: '3px 8px', fontSize: 10, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                  title="Supprimer"
                >🗑</button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#ccc', marginBottom: 4, lineHeight: 1.4 }}>
              {n.message}
            </div>
            <div style={{ fontSize: 10, color: '#666' }}>
              {new Date(n.createdAt).toLocaleString('fr')}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

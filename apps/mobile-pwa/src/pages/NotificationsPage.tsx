import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, BellRing, Check, ArrowLeft } from 'lucide-react';
const API = "https://trans-bygagoos.onrender.com/api/v1";
function getToken() { return localStorage.getItem('chauffeur-token'); }

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => axios.get(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.data),
    refetchInterval: 20000,
  });

  const marquerLu = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/notifications/${id}/lu`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <a href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>

      </a>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell size={24} /> Notifications
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifs?.map((n: any) => (
          <div key={n.id} style={{
            background: n.lu ? '#1e293b' : 'rgba(233,69,96,0.08)',
            border: n.lu ? '1px solid #1e293b' : '1px solid rgba(233,69,96,0.2)',
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: n.type === 'VERSEMENT' ? 'rgba(234,179,8,0.15)' : n.type === 'ASSISTANCE' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <BellRing size={18} color={n.type === 'VERSEMENT' ? '#eab308' : n.type === 'ASSISTANCE' ? '#ef4444' : '#3b82f6'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{n.titre}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{n.message}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{new Date(n.createdAt).toLocaleString('fr')}</div>
            </div>
            {!n.lu && (
              <button onClick={() => marquerLu.mutate(n.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
                <Check size={16} />
              </button>
            )}
          </div>
        ))}
        {!notifs?.length && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Aucune notification</div>
        )}
      </div>
    </div>
  );
}

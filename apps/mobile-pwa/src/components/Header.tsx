import { LogOut, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../stores/authStore';
import apiClient from '../api/client';

interface HeaderProps {
  onNotifications: () => void;
}

export default function Header({ onNotifications }: HeaderProps) {
  const { chauffeur, moto, logout } = useAuth();

  const { data: notifs } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => apiClient.get('/notifications').then(r => r.data).catch(() => []),
    refetchInterval: 15000,
  });

  const nonLues = Array.isArray(notifs) ? notifs.filter((n: any) => !n.lu).length : 0;

  const statusMap: Record<string, { class: string; icon: string; label: string }> = {
    EN_SERVICE:  { class: 'presence-present', icon: '🟢', label: 'En service' },
    EN_PAUSE:    { class: 'presence-pause',  icon: '🟠', label: 'En pause' },
    HORS_SERVICE:{ class: 'presence-absent', icon: '🔴', label: 'Hors service' },
  };

  const st = statusMap[chauffeur?.statut || ''] || statusMap.HORS_SERVICE;

  return (
    <div className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-logo">
            <img src="/assets/logo/b-trans.png" alt="Logo" />
          </div>
          <div className="header-info">
            <h1>{chauffeur?.nom || 'Chauffeur'}</h1>
            <p>
              <span className={`presence-badge ${st.class}`}>{st.icon} {st.label}</span>
              <span className={`moto-badge ${!moto ? 'sans-moto' : ''}`}>
                🏍️ {moto?.immatriculation || 'Pas de moto'}
              </span>
            </p>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={onNotifications} style={{ position: 'relative' }}>
            <Bell size={18} />
            {nonLues > 0 && <span className="notif-badge">{nonLues}</span>}
          </button>
          <button className="icon-btn logout" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

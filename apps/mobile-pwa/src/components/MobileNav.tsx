import { useNavigate, useLocation } from 'react-router-dom';
import { Bike, Clock, PlusCircle, DollarSign, Bell } from 'lucide-react';

const tabs = [
  { path: '/dashboard', icon: Bike, label: 'Accueil' },
  { path: '/pointage', icon: Clock, label: 'Pointage' },
  { path: '/course', icon: PlusCircle, label: 'Course' },
  { path: '/versements', icon: DollarSign, label: 'Versements' },
  { path: '/notifications', icon: Bell, label: 'Notifs' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', zIndex: 100 }}>
      {tabs.map((tab) => (
        <button key={tab.path} onClick={() => navigate(tab.path)}
          style={{
            flex: 1, padding: '10px 4px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2, background: 'none', border: 'none',
            color: location.pathname === tab.path ? '#e94560' : '#64748b',
            cursor: 'pointer', fontSize: 10, fontWeight: location.pathname === tab.path ? 600 : 400,
          }}>
          <tab.icon size={20} /> {tab.label}
        </button>
      ))}
    </nav>
  );
}

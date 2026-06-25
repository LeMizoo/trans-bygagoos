import { useNavigate, useLocation } from 'react-router-dom';
import { Home, History, HandCoins, BarChart3, User } from 'lucide-react';

const tabs = [
  { path: '/dashboard', icon: Home, label: 'Accueil' },
  { path: '/courses', icon: History, label: 'Courses' },
  { path: '/versements', icon: HandCoins, label: 'Versements' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/profil', icon: User, label: 'Profil' },
];

export function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {tabs.map(t => (
          <button key={t.path} onClick={() => navigate(t.path)} className={`nav-item ${location.pathname === t.path ? 'active' : ''}`}>
            <t.icon size={18} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

import { Home, ClipboardList, DollarSign, BarChart3, User } from 'lucide-react';
import type { Page } from '../stores/authStore';

interface BottomNavProps {
  current: Page;
  onChange: (p: Page) => void;
}

const tabs: { key: Page; label: string; icon: any; main?: boolean }[] = [
  { key: 'courses',    label: 'Courses',     icon: ClipboardList },
  { key: 'stats',      label: 'Stats',       icon: BarChart3 },
  { key: 'accueil',    label: 'Accueil',     icon: Home, main: true },
  { key: 'versements', label: 'Versements',  icon: DollarSign },
  { key: 'profil',     label: 'Profil',      icon: User },
];

export default function BottomNav({ current, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <div className="nav-items" style={{ overflowX: 'auto', justifyContent: 'center', gap: 2, padding: '0 4px' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`nav-item ${current === t.key ? 'active' : ''}`}
            style={{ minWidth: 55, flex: '0 0 auto' }}
          >
            {t.main ? (
              <t.icon size={24} style={{ color: '#DAA520' }} />
            ) : (
              <t.icon size={16} />
            )}
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

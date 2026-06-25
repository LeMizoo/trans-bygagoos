import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, PlusCircle } from 'lucide-react';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/pointage', icon: Clock, label: 'Pointage' },
    { path: '/course', icon: PlusCircle, label: 'Course' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
              location.pathname === tab.path ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

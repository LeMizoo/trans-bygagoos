import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bike, LogOut, Menu, X, Bell, Sun, Moon, Monitor,
  Settings, CreditCard, MapPin, Receipt, Wallet, BarChart3
} from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuStructure = [
    { icon: LayoutDashboard, label: '📊 Dashboard', path: '/dashboard' },
    { icon: Users, label: '👤 Chauffeurs', path: '/chauffeurs' },
    { icon: Bike, label: '🏍️ Motos', path: '/vehicules' },
    { icon: MapPin, label: '🛵 Courses', path: '/courses' },
    { icon: Receipt, label: '💰 Dépenses', path: '/depenses' },
    { icon: Wallet, label: '💵 Versements', path: '/versements' },
    { icon: BarChart3, label: '📈 Rapports', path: '/rapports' },
    { icon: Settings, label: '⚙️ Paramètres', path: '/parametres' },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-orange-600 dark:bg-gray-900 text-white transition-transform duration-300 overflow-y-auto flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-5 border-b border-orange-500 dark:border-gray-700 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
              <span className="text-orange-600 font-bold">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Ma Flotte</h1>
              <p className="text-orange-200 dark:text-gray-400 text-xs">Gérant Flotte</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 mt-2 pb-4">
          {menuStructure.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-5 py-2.5 hover:bg-orange-500 dark:hover:bg-gray-800 transition-colors text-sm ${
                isActive(item.path) ? 'bg-orange-500 dark:bg-gray-800 font-bold border-l-2 border-l-white' : ''
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-shrink-0 p-4 border-t border-orange-500 dark:border-gray-700">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-500 transition-colors text-xs">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:ml-64">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 transition-colors duration-200">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <Bell size={18} className="text-gray-400" />
              <span className="text-sm text-gray-500">Gérant Flotte</span>
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">F</div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8 min-h-[calc(100vh-8rem)]">{children}</main>
        <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
          © 2026 Trans ByGagoos · Flotte
        </footer>
      </div>
    </div>
  );
};

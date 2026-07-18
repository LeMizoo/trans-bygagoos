import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Package, LogOut, Menu, X, Bike, Bell, Sun, Moon, Monitor,
  Settings, CreditCard, ChevronDown, ChevronRight, Wrench, ScrollText, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps { children: React.ReactNode; }

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['FLOTTES', 'COOPS', 'OPERATIONS']);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    else root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleExpand = (key: string) => setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const menuStructure = [
    { icon: LayoutDashboard, label: '📊 Tableau de bord', path: '/dashboard' },
    {
      key: 'FLOTTES', icon: Bike, label: '🏍️ Flottes', children: [
        { label: 'Liste des flottes', path: '/flottes' },
        { label: 'Abonnements', path: '/abonnements?type=FLOTTE' },
        { label: 'Paramètres', path: '/parametres?type=FLOTTE' },
      ]
    },
    {
      key: 'COOPS', icon: Package, label: '📦 Coops', children: [
        { label: 'Liste des coops', path: '/coops' },
        { label: 'Abonnements', path: '/abonnements?type=COOP' },
        { label: 'Paramètres', path: '/parametres?type=COOP' },
      ]
    },
    {
      key: 'OPERATIONS', icon: Wrench, label: '🔧 Opérations', children: [
        { label: 'Livreurs', path: '/livreurs' },
        { label: 'Véhicules', path: '/vehicules' },
        { label: 'Commandes', path: '/commandes' },
      ]
    },
    { icon: ScrollText, label: '📋 Logs', path: '/logs' },
    { icon: Settings, label: '⚙️ Paramètres généraux', path: '/parametres' },
  ];

  const ThemeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-indigo-700 dark:bg-gray-900 text-white transition-transform duration-300 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-5 border-b border-indigo-600 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-lg font-bold">Trans ByGagoos</h1>
              <p className="text-indigo-200 dark:text-gray-400 text-xs">Super Admin</p>
            </div>
          </Link>
        </div>
        <nav className="mt-2 pb-16">
          {menuStructure.map((item: any) => {
            if (item.children) {
              const isExpanded = expanded.includes(item.key);
              return (
                <div key={item.key}>
                  <button onClick={() => toggleExpand(item.key)}
                    className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors text-sm">
                    <span className="flex items-center gap-3"><item.icon size={17} />{item.label}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {isExpanded && item.children.map((child: any) => (
                    <Link key={child.path} to={child.path}
                      className={`flex items-center pl-14 pr-5 py-2 text-xs hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors ${location.pathname + location.search === child.path ? 'bg-indigo-600 dark:bg-gray-800 font-bold' : ''}`}
                      onClick={() => setSidebarOpen(false)}>{child.label}</Link>
                  ))}
                </div>
              );
            }
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center px-5 py-2.5 hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors text-sm ${location.pathname === item.path ? 'bg-indigo-600 dark:bg-gray-800 font-bold' : ''}`}
                onClick={() => setSidebarOpen(false)}><item.icon size={17} className="mr-3" />{item.label}</Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-600 dark:border-gray-700 bg-indigo-700 dark:bg-gray-900">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-indigo-600 dark:hover:bg-gray-800 text-xs mb-2 transition-colors">
            <ThemeIcon size={16} /> {theme === 'dark' ? 'Mode clair' : theme === 'light' ? 'Mode système' : 'Mode sombre'}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-xs">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <div className="lg:ml-64">
        {/* HEADER AVEC MENU APPS */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-1">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mr-2">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              {/* Menu rapide apps */}
              <span className="hidden sm:flex items-center gap-1 text-xs font-medium">
                <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg">👑 Admin</span>
                <a href="https://flotte-bygagoos.pages.dev" target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-500 hover:text-orange-600 rounded-lg transition-colors flex items-center gap-1">
                  🏍️ Flotte <ExternalLink size={10} />
                </a>
                <a href="https://coop-bygagoos.pages.dev" target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-500 hover:text-green-600 rounded-lg transition-colors flex items-center gap-1">
                  📦 Coop <ExternalLink size={10} />
                </a>
                <a href="https://drivers-bygagoos.pages.dev" target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-500 hover:text-purple-600 rounded-lg transition-colors flex items-center gap-1">
                  📱 Driver <ExternalLink size={10} />
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
                <Bell size={18} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:block">{user?.nom || 'Admin'}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">{user?.nom?.charAt(0) || 'A'}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
        <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <img src="/assets/logo/b-trans.png" alt="ByGagoos" className="w-5 h-5 object-contain inline rounded mr-1" /> © 2026 Trans ByGagoos
        </footer>
      </div>
    </div>
  );
};

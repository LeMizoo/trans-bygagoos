import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Package, LogOut, Menu, X, Bike, Bell, Sun, Moon, Monitor, Settings, CreditCard, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps { children: React.ReactNode; }

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['FLOTTES', 'COOPS']);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    else root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleExpand = (key: string) => {
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const menuStructure = [
    { icon: LayoutDashboard, label: '📊 Tableau de bord', path: '/dashboard' },
    {
      key: 'FLOTTES', icon: Building2, label: '🏍️ Flottes', children: [
        { label: 'Liste des flottes', path: '/flottes' },
        { label: 'Abonnements', path: '/abonnements?type=FLOTTE' },
        { label: 'Paramètres', path: '/parametres?type=FLOTTE' },
        { label: 'Livreurs', path: '/livreurs?type=FLOTTE' },
        { label: 'Véhicules', path: '/vehicules?type=FLOTTE' },
      ]
    },
    {
      key: 'COOPS', icon: Package, label: '📦 Coops', children: [
        { label: 'Liste des coops', path: '/coops' },
        { label: 'Abonnements', path: '/abonnements?type=COOP' },
        { label: 'Paramètres', path: '/parametres?type=COOP' },
        { label: 'Livreurs', path: '/livreurs?type=COOP' },
        { label: 'Véhicules', path: '/vehicules?type=COOP' },
        { label: 'Commandes', path: '/commandes' },
      ]
    },
    { icon: Settings, label: '⚙️ Paramètres généraux', path: '/parametres' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-indigo-700 dark:bg-gray-900 text-white transition-transform duration-300 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-indigo-600 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-lg font-bold">Trans ByGagoos</h1>
              <p className="text-indigo-200 dark:text-gray-400 text-xs">Administration</p>
            </div>
          </Link>
        </div>
        <nav className="mt-2 pb-4">
          {menuStructure.map((item: any) => {
            if (item.children) {
              const isExpanded = expanded.includes(item.key);
              return (
                <div key={item.key}>
                  <button onClick={() => toggleExpand(item.key)}
                    className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors text-sm">
                    <span className="flex items-center gap-3"><item.icon size={18} />{item.label}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {isExpanded && item.children.map((child: any) => (
                    <Link key={child.path} to={child.path}
                      className={`flex items-center pl-14 pr-6 py-2 text-xs hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors ${location.pathname + location.search === child.path ? 'bg-indigo-600 dark:bg-gray-800' : ''}`}
                      onClick={() => setSidebarOpen(false)}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              );
            }
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center px-6 py-2.5 hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors text-sm ${location.pathname === item.path ? 'bg-indigo-600 dark:bg-gray-800' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <item.icon size={18} className="mr-3" />{item.label}
              </Link>
            );
          })}
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center px-6 py-2.5 w-full hover:bg-red-600 transition-colors text-left border-t border-indigo-600 dark:border-gray-700 mt-4 text-sm">
            <LogOut size={18} className="mr-3" />Déconnexion
          </button>
        </nav>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <div className="lg:ml-64">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <a href="https://trans-bygagoos.pages.dev" target="_blank" className="text-xs text-gray-400 hover:text-indigo-500 transition-colors hidden sm:block">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : theme === 'light' ? <Moon size={18} /> : <Monitor size={18} />}
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          {children}
        </main>
        <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <img src="/assets/logo/b-trans.png" alt="ByGagoos" className="w-5 h-5 object-contain inline rounded mr-1" /> © 2026 Trans ByGagoos ❤️
        </footer>
      </div>
    </div>
  );
};

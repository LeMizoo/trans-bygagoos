import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Package, LogOut, Menu, X, Bike, Bell, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps { children: React.ReactNode; }

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Building2, label: 'Coopératives', path: '/coops' },
    { icon: Users, label: 'Livreurs', path: '/livreurs' },
    { icon: Bike, label: 'Véhicules', path: '/vehicules' },
    { icon: Package, label: 'Commandes', path: '/commandes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-indigo-700 dark:bg-gray-900 text-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-indigo-600 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-lg font-bold">Trans ByGagoos</h1>
              <p className="text-indigo-200 dark:text-gray-400 text-xs">Administration</p>
            </div>
          </Link>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors ${location.pathname === item.path ? 'bg-indigo-600 dark:bg-gray-800' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <item.icon className="h-5 w-5 mr-3" /><span>{item.label}</span>
            </Link>
          ))}
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center px-6 py-3 w-full hover:bg-red-600 transition-colors text-left border-t border-indigo-600 dark:border-gray-700 mt-4">
            <LogOut className="h-5 w-5 mr-3" /><span>Déconnexion</span>
          </button>
        </nav>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {sidebarOpen ? <X className="h-6 w-6 dark:text-white" /> : <Menu className="h-6 w-6 dark:text-white" />}
            </button>
            <div className="flex-1 lg:hidden"></div>
            <div className="flex items-center gap-3 ml-auto">
              {/* Theme toggle */}
              <button onClick={cycleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300" title={`Thème: ${theme}`}>
                {theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.nom}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">SUPER ADMIN</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

// force recompile Rapports
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Package, LogOut, Menu, X, Bike, Bell, Sun, Moon, Monitor,
  Settings, CreditCard, ChevronDown, ChevronRight, Wrench, ScrollText, ExternalLink,
  Users, ShoppingCart, MapPin, Receipt, Wallet, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTheme, toggleTheme } from '../../stores/themeStore';

interface LayoutProps { children: React.ReactNode; }

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['FLOTTES', 'COOPS', 'OPERATIONS', 'FINANCES']);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(getTheme());

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  };

  const toggleExpand = (key: string) => {
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const isActive = (path: string) => {
    if (path.includes('?')) return location.pathname + location.search === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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
        { label: 'Chauffeurs', path: '/chauffeurs', icon: Users },
        { label: 'Livreurs', path: '/livreurs', icon: Users },
        { label: 'Véhicules', path: '/vehicules', icon: Bike },
        { label: 'Commandes', path: '/commandes', icon: ShoppingCart },
        { label: 'Courses', path: '/courses', icon: MapPin },
      ]
    },
    {
      key: 'FINANCES', icon: CreditCard, label: '💰 Finances', children: [
        { label: 'Dépenses', path: '/depenses', icon: Receipt },
        { label: 'Versements', path: '/versements', icon: Wallet },
      ]
    },
    { icon: ScrollText, label: '📋 Logs', path: '/logs' },
    { icon: BarChart3, label: '📈 Rapports', path: '/rapports' },
    { icon: Wrench, label: '🔧 Assistance', path: '/assistance' },
    { icon: Settings, label: '⚙️ Paramètres', path: '/parametres' },
  ];

  const ThemeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor;
  const themeLabel = theme === 'dark' ? 'Mode clair' : theme === 'light' ? 'Mode système' : 'Mode sombre';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-indigo-700 dark:bg-gray-900 text-white transition-transform duration-300 overflow-y-auto sidebar-scroll flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-5 border-b border-indigo-600 dark:border-gray-700 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-10 h-10 object-contain rounded-lg" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Trans ByGagoos</h1>
              <p className="text-indigo-200 dark:text-gray-400 text-xs">Super Admin</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 mt-2 pb-4">
          {menuStructure.map((item: any) => {
            if (item.children) {
              const isExpanded = expanded.includes(item.key);
              const hasActiveChild = item.children.some((child: any) => isActive(child.path));
              return (
                <div key={item.key}>
                  <button onClick={() => toggleExpand(item.key)}
                    className={`w-full flex items-center justify-between px-5 py-2.5 hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors text-sm ${hasActiveChild ? 'bg-indigo-600/50 dark:bg-gray-800/50' : ''}`}>
                    <span className="flex items-center gap-3"><item.icon size={17} />{item.label}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {isExpanded && (
                    <div className="bg-indigo-800/30 dark:bg-gray-800/30 py-1">
                      {item.children.map((child: any) => (
                        <Link key={child.path} to={child.path} onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 pl-14 pr-5 py-2 text-xs hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors ${isActive(child.path) ? 'bg-indigo-600 dark:bg-gray-800 font-bold border-l-2 border-l-white' : ''}`}>
                          {child.icon && <child.icon size={13} />}{child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-5 py-2.5 hover:bg-indigo-600 dark:hover:bg-gray-800 transition-colors text-sm ${isActive(item.path) ? 'bg-indigo-600 dark:bg-gray-800 font-bold border-l-2 border-l-white' : ''}`}>
                <item.icon size={17} />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 p-4 border-t border-indigo-600 dark:border-gray-700 bg-indigo-700 dark:bg-gray-900">
          <button onClick={handleThemeToggle} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-indigo-600 dark:hover:bg-gray-800 text-xs mb-2 transition-colors">
            <ThemeIcon size={16} /> {themeLabel}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-xs">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="lg:ml-64">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 transition-colors duration-200">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-1">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mr-2">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span className="hidden sm:flex items-center gap-1 text-xs font-medium">
                <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg">👑 Admin</span>
                <a href="https://flotte-bygagoos.pages.dev" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-500 hover:text-orange-600 rounded-lg transition-colors flex items-center gap-1">🏍️ Flotte <ExternalLink size={10} /></a>
                <a href="https://coop-bygagoos.pages.dev" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-500 hover:text-green-600 rounded-lg transition-colors flex items-center gap-1">📦 Coop <ExternalLink size={10} /></a>
                <a href="https://drivers-bygagoos.pages.dev" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-500 hover:text-purple-600 rounded-lg transition-colors flex items-center gap-1">📱 Driver <ExternalLink size={10} /></a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/notifications" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
                <Bell size={18} /><span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:block">{user?.nom || 'Admin'}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">{user?.nom?.charAt(0) || 'A'}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8 min-h-[calc(100vh-8rem)]">{children}</main>
        <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <img src="/assets/logo/b-trans.png" alt="ByGagoos" className="w-4 h-4 object-contain inline rounded mr-1" /> 
          © 2026 Trans ByGagoos · Tous droits réservés
        </footer>
      </div>
    </div>
  );
};

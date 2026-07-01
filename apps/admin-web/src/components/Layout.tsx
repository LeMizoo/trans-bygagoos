import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Bike, Building2, CreditCard,
  AlertCircle, Settings, Bell, MessageSquare,
  LogOut, X, Menu, Sun, Moon, ChevronDown, ChevronRight,
  Shield, BarChart3, TrendingUp, Activity
} from 'lucide-react';
import { Header } from './Header';

const superAdminMenu = [
  { title: 'Principal', items: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/app' },
    { label: 'Flottes', icon: Building2, path: '/app/flottes' },
    { label: 'Abonnements', icon: CreditCard, path: '/app/abonnements' },
  ]},
  { title: 'Support', items: [
    { label: 'Assistance', icon: AlertCircle, path: '/app/assistance' },
    { label: 'Messages', icon: MessageSquare, path: '/app/messages' },
    { label: 'Notifications', icon: Bell, path: '/app/notifications' },
  ]},
  { title: 'Administration', items: [
    { label: 'Utilisateurs', icon: Shield, path: '/app/utilisateurs' },
    { label: 'Paramètres', icon: Settings, path: '/app/parametres' },
  ]},
];

const gerantMenu = [
  { title: 'Principal', items: [{ label: 'Tableau de bord', icon: LayoutDashboard, path: '/app' }] },
  { title: 'Ma Flotte', items: [
    { label: 'Motos', icon: Bike, path: '/app/motos' },
    { label: 'Chauffeurs', icon: Users, path: '/app/chauffeurs' },
    { label: 'Profil Flotte', icon: Building2, path: '/app/proprietaires' },
  ]},
  { title: 'Activité', items: [
    { label: 'Courses', icon: TrendingUp, path: '/app/courses' },
    { label: 'Versements', icon: BarChart3, path: '/app/versements' },
  ]},
  { title: 'Finances', items: [
    { label: 'Dépenses', icon: Activity, path: '/app/depenses' },
    { label: 'Rapports', icon: BarChart3, path: '/app/rapports' },
  ]},
  { title: 'Support', items: [
    { label: 'Assistance', icon: AlertCircle, path: '/app/assistance' },
    { label: 'Messages', icon: MessageSquare, path: '/app/messages' },
  ]},
  { title: 'Paramètres', items: [
    { label: 'Paramètres', icon: Settings, path: '/app/parametres' },
    { label: 'Notifications', icon: Bell, path: '/app/notifications' },
  ]},
];

const menusByRole: Record<string, any> = {
  SUPER_ADMIN: superAdminMenu,
  ADMIN: superAdminMenu,
  GERANT: gerantMenu,
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = menusByRole[user?.role || 'GERANT'] || gerantMenu;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <a href="/" className="flex items-center gap-3">
            <img src="/assets/logo/b-trans.png" alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">Trans ByGagoos</h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {user?.role === 'SUPER_ADMIN' ? '👑 Plateforme' : '🏢 ' + (user?.flotte?.nom || 'Gérant')}
              </p>
            </div>
          </a>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuSections.map((section: any) => (
            <div key={section.title}>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{section.title}</div>
              <div className="space-y-0.5 mb-1">
                {section.items.map((item: any) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                        isActive ? 'bg-primary text-white font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                      <Icon size={18} />
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"><Users size={14} className="text-white" /></div>
            <div className="min-w-0"><p className="text-xs font-medium truncate">{user?.nom || 'Admin'}</p><p className="text-[10px] text-gray-400">{user?.role || 'admin'}</p></div>
            <button onClick={toggle} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ml-auto">{theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} />}</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50"><LogOut size={14} /> Déconnexion</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto"><Outlet /></main>
        <footer className="text-center py-3 text-[11px] text-gray-400 border-t">© 2026 Trans ByGagoos ❤️</footer>
      </div>
    </div>
  );
}

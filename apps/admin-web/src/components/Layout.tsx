import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Bike, UserCog, MapPin, Clock,
  DollarSign, AlertCircle, Settings, Bell,
  MessageSquare, LogOut, X, Menu, Sun, Moon, Receipt,
  BarChart3, ClipboardList, Wrench, ChevronDown, ChevronRight
} from 'lucide-react';
import { Header } from './Header';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const menuSections = [
  {
    title: 'Principal',
    items: [
      { label: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
    ],
  },
  {
    title: 'Flotte',
    items: [
      { label: 'Motos', icon: Bike, path: '/motos' },
      { label: 'Chauffeurs', icon: Users, path: '/chauffeurs' },
      { label: 'Propriétaires', icon: UserCog, path: '/proprietaires' },
    ],
  },
  {
    title: 'Activité',
    items: [
      { label: 'Courses', icon: MapPin, path: '/courses' },
      { label: 'Pointages', icon: Clock, path: '/pointages' },
      { label: 'Versements', icon: DollarSign, path: '/versements' },
      { label: 'Contrats', icon: ClipboardList, path: '/contrats' },
    ],
  },
  {
    title: 'Finances',
    items: [
      { label: 'Dépenses', icon: Receipt, path: '/depenses' },
      { label: 'Rapports', icon: BarChart3, path: '/rapports' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Assistance', icon: AlertCircle, path: '/assistance' },
      { label: 'Messages', icon: MessageSquare, path: '/messages' },
    ],
  },
  {
    title: 'Système',
    items: [
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Paramètres', icon: Settings, path: '/parametres' },
    ],
  },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: badgeVersements = 0 } = useQuery({
    queryKey: ['badge-versements'],
    queryFn: () => axios.get(`${API}/versements?statut=EN_ATTENTE`).then(r => Array.isArray(r.data) ? r.data.length : r.data?.items?.length || 0),
    refetchInterval: 30000,
  });
  const { data: badgeAssistance = 0 } = useQuery({
    queryKey: ['badge-assistance'],
    queryFn: () => axios.get(`${API}/assistance?urgence=haute`).then(r => Array.isArray(r.data) ? r.data.length : r.data?.items?.length || 0),
    refetchInterval: 30000,
  });

  const toggleCollapse = (title: string) => {
    setCollapsed(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <img src="/assets/logo/b-trans.png" alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">Trans ByGagoos</h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Administration</p>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuSections.map((section) => {
            const isCollapsed = collapsed.includes(section.title);
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleCollapse(section.title)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {section.title}
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mb-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                            isActive
                              ? 'bg-primary text-white font-medium'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.path === '/versements' && badgeVersements > 0 && (
                            <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{badgeVersements}</span>
                          )}
                          {item.path === '/assistance' && badgeAssistance > 0 && (
                            <span className="bg-orange-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{badgeAssistance}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Users size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium dark:text-gray-200 truncate">{user?.nom || 'Admin'}</p>
              <p className="text-[10px] text-gray-400">{user?.role || 'admin'}</p>
            </div>
            <button onClick={toggle} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ml-auto">
              {theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} />}
            </button>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8" />
                <h1 className="text-sm font-bold dark:text-white">Trans ByGagoos</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="dark:text-gray-200" />
              </button>
            </div>
            {menuSections.map((section) => (
              <div key={section.title} className="mb-2">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">{section.title}</div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        location.pathname === item.path
                          ? 'bg-primary text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <Icon size={18} /> {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <footer className="text-center py-3 text-[11px] text-gray-400 dark:text-gray-600 border-t border-gray-200 dark:border-gray-700">
          © 2026 Trans ByGagoos - Ensemble pour la famille Gagoos ❤️
        </footer>
      </div>
    </div>
  );
}

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Bike, UserCog, MapPin, Clock,
  DollarSign, AlertCircle, FileText, Settings, Bell,
  MessageSquare, LogOut, X, Menu, Sun, Moon, Receipt,
  TrendingUp, Shield, Archive, QrCode, Wrench, HandCoins,
  History, Calculator, Undo, Tag, BarChart3, UserPlus,
  ClipboardList, HardDrive, Calendar
} from 'lucide-react';
import { Header } from './Header';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const menuSections = [
  {
    title: '📊 Dashboard',
    items: [
      { label: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
    ]
  },
  {
    title: '🚗 Flotte & Personnel',
    items: [
      { label: 'Chauffeurs', icon: Users, path: '/chauffeurs' },
      { label: 'Codes chauffeurs', icon: QrCode, path: '/codes' },
      { label: 'Motos', icon: Bike, path: '/motos' },
      { label: 'Propriétaires', icon: UserCog, path: '/proprietaires' },
    ]
  },
  {
    title: '📈 Activités',
    items: [
      { label: 'Courses', icon: MapPin, path: '/courses' },
      { label: 'Pointages', icon: Clock, path: '/pointages' },
      { label: 'Versements', icon: DollarSign, path: '/versements' },
      { label: 'Contrats', icon: FileText, path: '/contrats' },
    ]
  },
  {
    title: '💰 Finances',
    items: [
      { label: 'Dépenses', icon: Receipt, path: '/depenses' },
      { label: 'Rapports', icon: BarChart3, path: '/rapports' },
    ]
  },
  {
    title: '📨 Communication',
    items: [
      { label: 'Messages', icon: MessageSquare, path: '/messages' },
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Assistance', icon: AlertCircle, path: '/assistance' },
    ]
  },
  {
    title: '⚙️ Administration',
    items: [
      { label: 'Paramètres', icon: Settings, path: '/parametres' },
      { label: 'Utilisateurs', icon: UserPlus, path: '/utilisateurs' },
    ]
  },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Badges
  const { data: badgeVersements } = useQuery({
    queryKey: ['badge-versements'],
    queryFn: () => axios.get(`${API}/versements`).then(r => r.data?.filter((v: any) => v.statut === 'EN_ATTENTE').length || 0),
    refetchInterval: 30000,
  });
  const { data: badgeAssistance } = useQuery({
    queryKey: ['badge-assistance'],
    queryFn: () => axios.get(`${API}/assistance`).then(r => r.data?.filter((a: any) => a.statut === 'OUVERT').length || 0),
    refetchInterval: 30000,
  });
  const { data: badgeNotifs } = useQuery({
    queryKey: ['badge-notifs'],
    queryFn: () => axios.get(`${API}/notifications/count`).then(r => r.data || 0),
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <img src="/assets/logo/b-trans.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Trans ByGagoos</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Administration</p>
          </div>
        </div>

        {/* Menu sections */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {menuSections.map((section, i) => (
            <div key={i}>
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-2">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? 'bg-primary text-white font-medium shadow-lg shadow-primary/25'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.path === '/versements' && (badgeVersements > 0) && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">{badgeVersements}</span>
                      )}
                      {item.path === '/assistance' && (badgeAssistance > 0) && (
                        <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">{badgeAssistance}</span>
                      )}
                      {item.path === '/notifications' && (badgeNotifs > 0) && (
                        <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">{badgeNotifs}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profil + Déconnexion */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium dark:text-gray-200 truncate">{user?.nom}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
            </button>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* SIDEBAR MOBILE */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8 object-contain rounded" />
                <h1 className="text-lg font-bold dark:text-white">Trans ByGagoos</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)}><X size={20} className="dark:text-gray-200" /></button>
            </div>
            {menuSections.map((section, i) => (
              <div key={i} className="mb-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">{section.title}</div>
                {section.items.map((item) => (
                  <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                      location.pathname === item.path ? 'bg-primary text-white font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                    <item.icon size={18} /> {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

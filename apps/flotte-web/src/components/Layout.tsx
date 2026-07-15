import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LayoutDashboard, Users, Bike, Building2, CreditCard, MessageSquare, LogOut, X, Menu, Sun, Moon, Monitor, ChevronDown, Settings, TrendingUp, Activity, BarChart3, Bell } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api';

const menuSections = [
  { title: 'Principal', items: [
    { label: 'Ma Flotte', icon: LayoutDashboard, path: '/dashboard' },
  ]},
  { title: 'Gestion', items: [
    { label: 'Parc auto', icon: Bike, path: '/motos' },
    { label: 'Chauffeurs', icon: Users, path: '/chauffeurs' },
    { label: 'Locations', icon: Building2, path: '/locations' },
  ]},
  { title: 'Activité', items: [
    { label: 'Courses', icon: TrendingUp, path: '/courses' },
    { label: 'Versements', icon: BarChart3, path: '/versements' },
  ]},
  { title: 'Finances', items: [
    { label: 'Dépenses', icon: Activity, path: '/depenses' },
    { label: 'Rapports', icon: BarChart3, path: '/rapports' },
  ]},
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: flotte } = useQuery({
    queryKey: ['flotte-layout', user?.coopId],
    queryFn: () => axios.get(`${API}/coops/${user?.coopId}`).then(r => r.data),
    enabled: !!user?.coopId,
  });

  const cycleTheme = () => {
    const t = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    if (t === 'system') {
      document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      document.documentElement.classList.toggle('dark', t === 'dark');
    }
    toggle();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Ma Flotte ByGagoos</h1>
              <p className="text-[10px] text-gray-400">🏍️ Gérant</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase">{section.title}</div>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${isActive ? 'bg-primary text-white font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <item.icon size={18} /><span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"><Users size={14} className="text-white" /></div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate dark:text-white">{user?.nom || 'Gérant'}</p>
              <p className="text-[10px] text-gray-400">GERANT</p>
            </div>
            <button onClick={cycleTheme} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ml-auto">
              {theme === 'light' ? <Sun size={14} className="text-yellow-400" /> : theme === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
            </button>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
            <button onClick={() => setSidebarOpen(false)} className="mb-4"><X size={20} className="dark:text-white" /></button>
            {menuSections.map((section) => (
              <div key={section.title} className="mb-2">
                <div className="text-[10px] font-semibold text-gray-400 uppercase px-2 py-1">{section.title}</div>
                {section.items.map((item) => (
                  <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${location.pathname === item.path ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    <item.icon size={18} /> {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Menu size={20} className="dark:text-white" /></button>
            <span className="text-sm text-gray-500 dark:text-gray-400">📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <div className="flex items-center gap-2">
              <button onClick={cycleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {theme === 'light' ? <Sun size={18} className="text-yellow-400" /> : theme === 'dark' ? <Moon size={18} className="dark:text-white" /> : <Monitor size={18} className="dark:text-white" />}
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500"><LogOut size={18} /></button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

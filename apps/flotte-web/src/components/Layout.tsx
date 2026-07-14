import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  LayoutDashboard, Users, Bike, Building2, CreditCard,
  MessageSquare, LogOut, X, Menu, Sun, Moon, ChevronDown, ChevronRight, Settings,
  TrendingUp, Activity, BarChart3, Bell
} from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

const menuSections = [
  { title: 'Principal', items: [
    { label: 'Ma Flotte', icon: LayoutDashboard, path: '/' },
    { label: 'Abonnement', icon: CreditCard, path: '/abonnements' },
  ]},
  { title: 'Ma Flotte', items: [
    { label: 'Parc auto', icon: Bike, path: '/motos' },
    { label: 'Chauffeurs', icon: Users, path: '/chauffeurs' },
  ]},
  { title: 'Activité', items: [
    { label: 'Courses', icon: TrendingUp, path: '/courses' },
    { label: 'Versements', icon: BarChart3, path: '/versements' },
  ]},
  { title: 'Finances', items: [
    { label: 'Dépenses', icon: Activity, path: '/depenses' },
    { label: 'Rapports', icon: BarChart3, path: '/rapports' },
  ]},
  { title: 'Support', items: [
    { label: 'Messages', icon: MessageSquare, path: '/messages' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Paramètres', icon: Settings, path: '/parametres' },
  ]},
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed] = useState<string[]>([]);
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: flotte } = useQuery({
    queryKey: ['flotte-layout', user?.flotteId],
    queryFn: () => axios.get(`${API}/flottes/${user?.flotteId}`).then(r => r.data),
    enabled: !!user?.flotteId,
  });

  const toggleCollapse = (title: string) => {
    toggleCollapsed(title);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <style>{`
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-left { animation: fadeInLeft 0.5s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.5s ease-out forwards; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
        .icon-btn { transition: all 0.2s ease; }
        .icon-btn:hover { transform: scale(1.1); }
      `}</style>

      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 animate-fade-in-left">
            {flotte?.logo ? <img src={flotte.logo} alt="Logo" className="w-9 h-9 object-contain rounded-lg" /> : <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center"><Building2 size={18} className="text-white" /></div>}
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">{flotte?.nom || "Ma Flotte"}</h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">🏢 Gérant</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuSections.map((section) => {
            const isCollapsed = false;
            return (
              <div key={section.title}>
                <button onClick={() => toggleCollapse(section.title)} className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
                  {section.title}
                  <ChevronDown size={12} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mb-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${isActive ? 'bg-primary text-white font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <Icon size={18} />
                          <span className="flex-1 text-left">{item.label}</span>
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
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"><Users size={14} className="text-white" /></div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{user?.nom || 'Gérant'}</p>
              <p className="text-[10px] text-gray-400">GERANT</p>
            </div>
            <button onClick={toggle} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ml-auto">{theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} />}</button>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 p-4 overflow-y-auto animate-fade-in-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">{flotte?.logo ? <img src={flotte.logo} alt="Logo" className="w-8 h-8 rounded-lg" /> : <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Building2 size={16} className="text-white" /></div>}<h1 className="text-sm font-bold">{flotte?.nom || "Ma Flotte"}</h1></div>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            {menuSections.map((section) => (
              <div key={section.title} className="mb-2">
                <div className="text-[10px] font-semibold text-gray-400 uppercase px-2 py-1">{section.title}</div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${location.pathname === item.path ? 'bg-primary text-white font-medium' : 'text-gray-600'}`}><Icon size={18} /> {item.label}</button>;
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3 animate-fade-in-left">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Menu size={20} /></button>
              <span className="text-sm text-gray-500">📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <div className="flex items-center gap-2 animate-slide-in-right">
              <span className="text-xs text-primary/70 hidden sm:inline">👥 Équipe</span>
              <button onClick={() => navigate("/messages")} className="icon-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Messages"><MessageSquare size={18} /></button>
              <button onClick={() => navigate("/notifications")} className="icon-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Notifications"><Bell size={18} /></button>
              <button onClick={toggle} className="icon-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">{theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}</button>
              <button onClick={() => { logout(); navigate('/login'); }} className="icon-btn p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500"><LogOut size={18} /></button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <footer className="text-center py-3 text-[11px] text-gray-400 border-t flex items-center justify-center gap-2">
          <img src="/assets/logo/b-trans.png" alt="ByGagoos" className="w-5 h-5 object-contain rounded" /> © 2026 Trans ByGagoos ❤️
        </footer>
      </div>
    </div>
  );
}


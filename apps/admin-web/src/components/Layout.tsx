import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  LayoutDashboard, Users, Bike, Building2, CreditCard,
  MapPin, Clock, DollarSign, AlertCircle, Settings, Bell,
  MessageSquare, Receipt, BarChart3, ClipboardList, Shield,
  LogOut, X, Menu, Sun, Moon, ChevronDown, ChevronRight
} from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

const superAdminMenu = [
  { title: 'Principal', items: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/app' },
    { label: 'Flottes', icon: Building2, path: '/app/flottes' },
    { label: 'Abonnements', icon: CreditCard, path: '/app/abonnements' },
  ]},
  { title: 'Supervision', items: [
    { label: 'Véhicules', icon: Bike, path: '/app/motos' },
    { label: 'Chauffeurs', icon: Users, path: '/app/chauffeurs' },
    { label: 'Courses', icon: MapPin, path: '/app/courses' },
  ]},
  { title: 'Finances', items: [
    { label: 'Versements', icon: DollarSign, path: '/app/versements' },
    { label: 'Dépenses', icon: Receipt, path: '/app/depenses' },
    { label: 'Rapports', icon: BarChart3, path: '/app/rapports' },
  ]},
  { title: 'Support', items: [
    { label: 'Assistance', icon: AlertCircle, path: '/app/assistance' },
    { label: 'Messages', icon: MessageSquare, path: '/app/messages' },
    { label: 'Notifications', icon: Bell, path: '/app/notifications' },
  ]},
  { title: 'Système', items: [
    { label: 'Utilisateurs', icon: Shield, path: '/app/utilisateurs' },
    { label: 'Paramètres', icon: Settings, path: '/app/parametres' },
    { label: 'Journaux', icon: ClipboardList, path: '/app/journaux' },
  ]},
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = superAdminMenu;

  const toggleCollapse = (title: string) => {
    setCollapsed(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img src="/assets/logo/b-trans.png" alt="ByGagoos" className="w-9 h-9 object-contain rounded-lg" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">Trans ByGagoos</h1>
              <p className="text-[10px] text-gray-400">👑 Plateforme</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuSections.map((section) => {
            const isCollapsed = collapsed.includes(section.title);
            return (
              <div key={section.title}>
                <button onClick={() => toggleCollapse(section.title)} className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                  {section.title}
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mb-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${isActive ? 'bg-primary text-white font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
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
            <div className="min-w-0"><p className="text-xs font-medium truncate">{user?.nom || 'Admin'}</p><p className="text-[10px] text-gray-400">{user?.role || 'ADMIN'}</p></div>
            <button onClick={toggle} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ml-auto">{theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} />}</button>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Menu size={20} /></button>
              <span className="text-sm text-gray-500">📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNotif(!showNotif)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative"><Bell size={18} /><span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span></button>
              <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">{theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}</button>
              <button onClick={() => { logout(); navigate('/login'); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500"><LogOut size={18} /></button>
            </div>
          </div>
        </header>
        {showNotif && (
          <div className="absolute right-4 top-14 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">🔔 Notifications</h3>
              <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-400 text-center py-4">Aucune notification</p>
          </div>
        )}
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

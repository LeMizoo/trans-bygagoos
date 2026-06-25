import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LayoutDashboard, Users, Bike, MapPin, DollarSign, Clock, AlertCircle, FileText, Settings, LogOut, X, Receipt, Bell, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Header } from './Header';

const menu = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Chauffeurs', icon: Users, path: '/chauffeurs' },
  { label: 'Motos', icon: Bike, path: '/motos' },
  { label: 'Courses', icon: MapPin, path: '/courses' },
  { label: 'Versements', icon: DollarSign, path: '/versements' },
  { label: 'Pointages', icon: Clock, path: '/pointages' },
  { label: 'Assistance', icon: AlertCircle, path: '/assistance' },
  { label: 'Contrats', icon: FileText, path: '/contrats' },
  { label: 'Dépenses', icon: Receipt, path: '/depenses' },
  { label: 'Messages', icon: MessageSquare, path: '/messages' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Paramètres', icon: Settings, path: '/parametres' },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <img src="/assets/logo/b-trans.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">ByGagoos</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Administration</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {menu.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 px-3 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Users size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium dark:text-gray-200">{user?.nom}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8 object-contain rounded" />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">ByGagoos</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)}><X size={20} className="dark:text-gray-200" /></button>
            </div>
            <nav className="space-y-0.5">
              {menu.map((item) => (
                <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                    location.pathname === item.path ? 'bg-primary text-white font-medium' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                  <item.icon size={18} /> {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { Bell, User, LogOut, Menu, Sun, Moon, HandCoins, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();

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
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Gauche */}
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <Menu size={20} className="dark:text-gray-200" />
        </button>
        <div className="hidden lg:flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            🕐 {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Droite - Badges + Actions */}
        <div className="flex items-center gap-2">
          {/* Badge Versements */}
          <button onClick={() => navigate('/versements')} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Versements en attente">
            <HandCoins size={18} className="dark:text-gray-300" />
            {(badgeVersements > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {badgeVersements}
              </span>
            )}
          </button>

          {/* Badge Assistance */}
          <button onClick={() => navigate('/assistance')} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Assistance en attente">
            <Wrench size={18} className="dark:text-gray-300" />
            {(badgeAssistance > 0) && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {badgeAssistance}
              </span>
            )}
          </button>

          {/* Badge Notifications */}
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Notifications">
            <Bell size={18} className="dark:text-gray-300" />
            {(badgeNotifs > 0) && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {badgeNotifs}
              </span>
            )}
          </button>

          {/* Thème */}
          <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="dark:text-gray-300" />}
          </button>

          {/* Profil */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium dark:text-gray-200">{user?.nom}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>

          {/* Déconnexion */}
          <button onClick={() => { logout(); navigate('/login'); }}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500" title="Déconnexion">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

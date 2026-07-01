import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { Bell, User, LogOut, Menu, Sun, Moon, Search, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

async function getBadgeNotifs() {
  try { const { data } = await axios.get(`${API}/notifications/count`); return typeof data === 'number' ? data : (data?.count || 0); } catch { return 0; }
}

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();

  const { data: badgeNotifs = 0 } = useQuery({ queryKey: ['badge-notifs'], queryFn: getBadgeNotifs, refetchInterval: 30000 });

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Menu size={20} className="dark:text-gray-200" /></button>
          <a href="/" className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity"><img src="/assets/logo/b-trans.png" alt="Accueil" className="w-8 h-8 object-contain" /></a>
          <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/app/messages')} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Messages"><MessageSquare size={18} className="dark:text-gray-300" /></button>
          <button onClick={() => navigate('/app/notifications')} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Notifications">
            <Bell size={18} className="dark:text-gray-300" />
            {badgeNotifs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{badgeNotifs}</span>}
          </button>
          <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">{theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="dark:text-gray-300" />}</button>
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"><User size={14} className="text-white" /></div>
            <div className="hidden md:block"><p className="text-sm font-medium dark:text-gray-200">{user?.nom || 'Admin'}</p><p className="text-xs text-gray-400">{user?.role === 'SUPER_ADMIN' ? '👑 Super Admin' : user?.role || 'ADMIN'}</p></div>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  );
}

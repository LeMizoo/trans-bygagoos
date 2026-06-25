import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { Bell, User, BellRing, Check, LogOut, Menu, Moon, Sun, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

import { API_URL } from '../lib/api';
const API = API_URL;

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfil, setShowProfil] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => axios.get(`${API}/notifications`).then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: count } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => axios.get(`${API}/notifications/count`).then(r => r.data),
    refetchInterval: 15000,
  });

  const marquerLu = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/notifications/${id}/lu`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeAll = () => {
    setShowNotifs(false);
    setShowProfil(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Gauche - Menu burger + Logo (mobile) */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Menu size={20} className="dark:text-gray-200" />
          </button>
          {/* Logo visible en mobile */}
          <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8 object-contain lg:hidden" />
          <h1 className="hidden lg:block text-lg font-semibold text-gray-700 dark:text-gray-200">Tableau de bord</h1>
        </div>

        {/* Droite - Actions */}
        <div className="flex items-center gap-1">
          <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-500 dark:text-gray-400" />}
          </button>

          <div className="relative">
            <button onClick={() => { setShowNotifs(!showNotifs); setShowProfil(false); }}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              {(count || 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                  <span className="text-xs text-gray-400">{count || 0} non lues</span>
                </div>
                {!notifs?.length && <div className="p-8 text-center text-gray-400 text-sm">Aucune notification</div>}
                {notifs?.map((n: any) => (
                  <div key={n.id} className={`p-3 border-b border-gray-50 dark:border-gray-700 flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.lu ? 'bg-red-50 dark:bg-red-500/5' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.type === 'VERSEMENT' ? 'bg-yellow-100 text-yellow-600' : n.type === 'ASSISTANCE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}><BellRing size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{n.titre}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('fr')}</p>
                    </div>
                    {!n.lu && <button onClick={() => marquerLu.mutate(n.id)} className="text-gray-400 hover:text-green-500"><Check size={14} /></button>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setShowProfil(!showProfil); setShowNotifs(false); }}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ml-1">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">{user?.nom || 'Admin'}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{user?.role || 'ADMIN'}</p>
              </div>
            </button>

            {showProfil && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.nom || 'Admin'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-medium">{user?.role}</span>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={() => { navigate('/parametres'); closeAll(); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center gap-2"><Settings size={16} /> Paramètres</div>
                    <ChevronRight size={14} />
                  </button>
                  <hr className="my-1 border-gray-100 dark:border-gray-700" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(showNotifs || showProfil) && <div className="fixed inset-0 z-30" onClick={closeAll} />}
    </header>
  );
}

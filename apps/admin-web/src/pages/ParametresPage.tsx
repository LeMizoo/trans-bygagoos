import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { User, Mail, Shield, Moon, Sun, Monitor, Bell, Key, LogOut, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ParametresPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const [nom, setNom] = useState(user?.nom || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>

      {/* Profil */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={20} className="text-primary" /> Profil
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <User size={30} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.nom}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Mail size={12} /> {user?.email}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
              <Shield size={10} className="inline mr-1" />{user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
            <input type="text" value={nom} onChange={e => setNom(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed" />
          </div>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <Save size={16} /> {saved ? 'Enregistré !' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Apparence */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Monitor size={20} className="text-primary" /> Apparence
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light' as const, icon: Sun, label: 'Clair', desc: 'Mode jour' },
            { value: 'dark' as const, icon: Moon, label: 'Sombre', desc: 'Mode nuit' },
            { value: 'system' as const, icon: Monitor, label: 'Système', desc: 'Auto' },
          ].map((t) => (
            <button key={t.value} onClick={() => setTheme(t.value)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                theme === t.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}>
              <t.icon size={24} className={`mx-auto mb-2 ${theme === t.value ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
              <p className={`text-sm font-medium ${theme === t.value ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>{t.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell size={20} className="text-primary" /> Notifications
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Versements</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Notifications des demandes de versement</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Assistance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Alertes d'assistance urgente</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Pointages</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Changements de statut des chauffeurs</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
          </label>
        </div>
      </div>

      {/* Sécurité */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key size={20} className="text-primary" /> Sécurité
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
            Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Déconnexion */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-500/20 p-6">
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-medium transition-colors">
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  );
}

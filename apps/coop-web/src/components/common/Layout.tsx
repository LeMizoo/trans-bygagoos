import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Users, MapPin, LogOut, Menu, X, Bell, Settings, ArrowLeft } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/commandes', label: 'Commandes', icon: Package },
    { path: '/livreurs', label: 'Livreurs', icon: Users },
    { path: '/suivi', label: 'Suivi GPS', icon: MapPin },
    { path: '/parametres', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 border-r border-slate-700 flex flex-col lg:relative lg:translate-x-0"
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            📦 Coop Express
          </h1>
        </div>
        
        {/* Lien retour landing page */}
        <a href="https://trans-bygagoos.pages.dev" target="_blank" rel="noopener noreferrer"
          className="mx-4 mt-4 flex items-center gap-2 text-xs text-slate-400 hover:text-green-400 transition-colors">
          <ArrowLeft size={14} /> Trans ByGagoos
        </a>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.aside>
      
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-slate-400 hover:text-white"><Bell size={18} /></button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  LogOut,
  Menu,
  X,
  ClipboardList,
  Home,
  Settings,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Users, label: 'Chauffeurs', path: '/chauffeurs' },
    { icon: Truck, label: 'Véhicules', path: '/vehicules' },
    { icon: ClipboardList, label: 'Locations', path: '/locations' },
    { icon: DollarSign, label: 'Finances', path: '/finances' },
    { icon: Settings, label: 'Paramètres', path: '/parametres' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-indigo-700 text-white transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        <div className="p-6 border-b border-indigo-600">
          <h1 className="text-2xl font-bold">🚐 Ma Flotte</h1>
          <p className="text-indigo-200 text-sm mt-1">Gestionnaire</p>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-6 py-3 hover:bg-indigo-600 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 w-full hover:bg-indigo-600 transition-colors text-left border-t border-indigo-600 mt-4"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </nav>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.nom}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                🟢 En ligne
              </span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

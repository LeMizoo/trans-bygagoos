import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Package,
  LogOut,
  Menu,
  X,
  Bike,
  Bell
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
    { icon: Building2, label: 'Coopératives', path: '/coops' },
    { icon: Users, label: 'Livreurs', path: '/livreurs' },
    { icon: Bike, label: 'Véhicules', path: '/vehicules' },
    { icon: Package, label: 'Commandes', path: '/commandes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-indigo-700 text-white transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        <div className="p-6 border-b border-indigo-600">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/assets/logo/b-trans.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-lg font-bold">Trans ByGagoos</h1>
              <p className="text-indigo-200 text-xs">Administration</p>
            </div>
          </Link>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-indigo-600 transition-colors ${
                location.pathname === item.path ? 'bg-indigo-600' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 w-full hover:bg-red-600 transition-colors text-left border-t border-indigo-600 mt-4"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            {/* Espace gauche vide pour pousser à droite */}
            <div className="flex-1 lg:hidden"></div>
            
            {/* Header droite */}
            <div className="flex items-center gap-3 ml-auto">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.nom}</p>
                <p className="text-xs text-indigo-600 font-medium">
                  {user?.role === 'ADMIN_COOP' ? 'SUPER ADMIN' : user?.role}
                </p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
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

export default Layout;

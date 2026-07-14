import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 text-white p-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">🚐 Trans Coop</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center">
            <LogOut className="h-5 w-5 mr-1" /> Déconnexion
          </button>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
};

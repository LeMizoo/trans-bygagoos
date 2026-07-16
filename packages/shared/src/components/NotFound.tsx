import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-indigo-500 mb-4">404</h1>
        <p className="text-xl mb-8">Page introuvable</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Retour au dashboard
        </button>
      </div>
    </div>
  );
};

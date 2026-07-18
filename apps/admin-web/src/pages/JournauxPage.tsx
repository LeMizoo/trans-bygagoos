import React from 'react';
import { ScrollText, Search, Filter } from 'lucide-react';

export const JournauxPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📋 Journaux</h2>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher dans les journaux..." className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter size={18} /> Filtrer
          </button>
        </div>
        <p className="text-gray-500 text-center py-8">Journal des activités - En développement</p>
      </div>
    </div>
  );
};

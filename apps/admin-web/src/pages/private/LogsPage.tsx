import React from 'react';
import { ScrollText, Clock, User, Activity } from 'lucide-react';

const logsData = [
  { id: 1, action: 'Connexion', user: 'tovoniaina.rahendrison@gmail.com', date: '2026-07-17 08:30', type: 'AUTH' },
  { id: 2, action: 'Modification paramètres Flotte', user: 'admin@bygagoos.com', date: '2026-07-17 07:15', type: 'ADMIN' },
  { id: 3, action: 'Nouvelle commande créée', user: 'jean@coopexpress.com', date: '2026-07-17 06:45', type: 'COMMANDE' },
  { id: 4, action: 'Véhicule assigné MOTO-001', user: 'abela@me.eu', date: '2026-07-16 18:20', type: 'FLOTTE' },
  { id: 5, action: 'Abonnement renouvelé', user: 'system', date: '2026-07-16 12:00', type: 'SYSTEM' },
];

const typeColors: any = {
  AUTH: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  COMMANDE: 'bg-green-100 text-green-700',
  FLOTTE: 'bg-orange-100 text-orange-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
};

export const LogsPage = () => {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Logs d'activité</h2>
        <p className="text-gray-500 mt-1">Historique des actions sur la plateforme</p>
      </div>
      <div className="space-y-3">
        {logsData.map(log => (
          <div key={log.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Activity size={20} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{log.action}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><User size={12} /> {log.user}</div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${typeColors[log.type]}`}>{log.type}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {log.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ScrollText, Clock, User, Activity, Search } from 'lucide-react';
import { api } from '../../api/client';

export const LogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/logs/recent?limit=50').then(res => {
      setLogs(Array.isArray(res.data) ? res.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l: any) =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Logs d'activité</h2>
          <p className="text-gray-500 mt-1">{logs.length} activités récentes</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-64" />
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((log: any) => (
          <div key={log.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Activity size={18} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{log.action || 'Action'}</div>
              <div className="text-sm text-gray-500">{log.details || ''}</div>
              <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                <User size={12} /> {log.user?.nom || 'Système'}
                <Clock size={12} /> {new Date(log.createdAt).toLocaleString('fr')}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucun log trouvé</p>
        )}
      </div>
    </div>
  );
};

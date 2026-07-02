import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MessageSquare } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function MessagesPage() {
  const { data } = useQuery({
    queryKey: ['messages'],
    queryFn: () => axios.get(`${API}/messages/conversations`).then(r => r.data),
    refetchInterval: 15000,
  });

  const conversations = Array.isArray(data) ? data : [];

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><MessageSquare size={24} /> Messages</h1>
      <div className="space-y-2">
        {conversations.map((c: any) => (
          <div key={c.id || c.chauffeurId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><MessageSquare size={18} className="text-primary" /></div>
            <div className="flex-1">
              <p className="font-medium text-sm">{c.chauffeur?.nom || 'Chauffeur'}</p>
              <p className="text-xs text-gray-400">{c.lastMessage || 'Pas de message'}</p>
            </div>
            {c.nonLu > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{c.nonLu}</span>}
          </div>
        ))}
        {conversations.length === 0 && <p className="text-gray-400 text-center py-12">Aucune conversation</p>}
      </div>
    </div>
  );
}

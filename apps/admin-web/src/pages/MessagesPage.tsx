import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MessageSquare, Send, User, Check, Archive, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const LIMIT = 10;

export function MessagesPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: conversations } = useQuery({
    queryKey: ['conversations', search],
    queryFn: () => axios.get(`${API}/messages/conversations?search=${search}`).then(r => r.data).catch(() => []),
    refetchInterval: 5000,
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedId, page],
    queryFn: () => axios.get(`${API}/messages/chauffeur/${selectedId}?page=${page}&limit=${LIMIT}`).then(r => r.data),
    enabled: !!selectedId,
    refetchInterval: 3000,
  });

  const msgs = messages?.items || messages || [];
  const total = messages?.total || 0;
  const pages = Math.ceil(total / LIMIT);

  const sendMsg = useMutation({
    mutationFn: () => axios.post(`${API}/messages`, { chauffeurId: selectedId, contenu: message, expediteur: 'ADMIN' }),
    onSuccess: () => { setMessage(''); queryClient.invalidateQueries({ queryKey: ['messages', selectedId] }); },
  });

  const supprimer = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/messages/${id}`).catch(() => {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', selectedId] }),
  });

  const convs = Array.isArray(conversations) ? conversations : [];

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Liste conversations */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 font-semibold flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-800">
          <MessageSquare size={18} /> Messages
        </div>
        <div className="p-2">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 border rounded-lg text-xs dark:bg-gray-700 dark:border-gray-600" />
          </div>
        </div>
        {convs.map((c: any) => (
          <button key={c.chauffeur?.id} onClick={() => { setSelectedId(c.chauffeur?.id); setPage(1); }}
            className={`w-full text-left p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedId === c.chauffeur?.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center"><User size={14} /></div>
                <div><p className="font-medium text-sm">{c.chauffeur?.nom}</p><p className="text-xs text-gray-400">{c.chauffeur?.codeAcces}</p></div>
              </div>
              {c.nonLu > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{c.nonLu}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">{c.lastMessage}</p>
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedId ? (
          <>
            <div className="p-4 border-b dark:border-gray-700 font-semibold">
              {convs.find((c: any) => c.chauffeur?.id === selectedId)?.chauffeur?.nom}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m: any) => (
                <div key={m.id} className={`flex ${m.expediteur === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.expediteur === 'ADMIN' ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'}`}>
                    {m.contenu}
                    <div className={`text-[10px] mt-1 ${m.expediteur === 'ADMIN' ? 'text-white/70' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                      <button onClick={() => supprimer.mutate(m.id)} className="ml-2 hover:text-red-500 inline" title="Supprimer">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {pages > 1 && (
              <div className="flex justify-center gap-2 p-2 border-t dark:border-gray-700">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
                <span className="text-xs text-gray-500 py-1">Page {page}/{pages}</span>
                <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"><ChevronRight size={16} /></button>
              </div>
            )}
            <div className="p-4 border-t dark:border-gray-700 flex gap-2">
              <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && message.trim() && sendMsg.mutate()}
                placeholder="Votre message..." className="flex-1 px-4 py-2 border rounded-full text-sm outline-none dark:bg-gray-700 dark:border-gray-600" />
              <button onClick={() => message.trim() && sendMsg.mutate()} disabled={!message.trim()}
                className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50"><Send size={18} /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><MessageSquare size={48} className="mx-auto mb-3" /><p>Sélectionnez une conversation</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MessageSquare, Send, User } from 'lucide-react';
const API = "https://trans-bygagoos.onrender.com/api/v1";

export function MessagesPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axios.get(`${API}/messages/conversations`).then(r => r.data),
    refetchInterval: 3000,
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: () => axios.get(`${API}/messages/chauffeur/${selectedId}`).then(r => r.data),
    enabled: !!selectedId,
    refetchInterval: 2000,
  });

  const sendMsg = useMutation({
    mutationFn: () => axios.post(`${API}/messages`, {
      chauffeurId: selectedId,
      contenu: message,
      expediteur: 'ADMIN',
    }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b font-semibold flex items-center gap-2 sticky top-0 bg-white"><MessageSquare size={18} /> Messages</div>
        {conversations?.map((c: any) => (
          <button key={c.chauffeur.id} onClick={() => setSelectedId(c.chauffeur.id)}
            className={`w-full text-left p-4 border-b hover:bg-gray-50 ${selectedId === c.chauffeur.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><User size={14} /></div>
              <div>
                <p className="font-medium text-sm">{c.chauffeur.nom}</p>
                <p className="text-xs text-gray-400">{c.chauffeur.codeAcces}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">{c.lastMessage}</p>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col bg-white">
        {selectedId ? (
          <>
            <div className="p-4 border-b font-semibold">{conversations?.find((c: any) => c.chauffeur.id === selectedId)?.chauffeur.nom}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages?.map((m: any) => (
                <div key={m.id} className={`flex ${m.expediteur === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.expediteur === 'ADMIN' ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                    <p className="text-xs font-semibold mb-1">{m.expediteur === 'ADMIN' ? 'Admin' : ''}</p>
                    {m.contenu}
                    <div className={`text-[10px] mt-1 ${m.expediteur === 'ADMIN' ? 'text-white/70' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && message.trim() && sendMsg.mutate()} placeholder="Votre message..." className="flex-1 px-4 py-2 border rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={() => message.trim() && sendMsg.mutate()} disabled={!message.trim()} className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50"><Send size={18} /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><MessageSquare size={48} className="mx-auto mb-3 text-gray-300" /><p>Sélectionnez une conversation</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

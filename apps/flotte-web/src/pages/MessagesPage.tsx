/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MessageSquare, Send, Search, User, Plus, X, Users } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function MessagesPage() {
  const qc = useQueryClient();
  const [selectedChauffeur, setSelectedChauffeur] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [selectedChauffeurs, setSelectedChauffeurs] = useState<string[]>([]);

  const { data: conversations } = useQuery({
    queryKey: ['messages-conversations'],
    queryFn: () => api.get('/messages/conversations`).then(r => r.data),
    refetchInterval: 10000,
  });

  // Tous les chauffeurs pour nouveau message
  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs-liste'],
    queryFn: () => api.get('/chauffeurs`).then(r => r.data),
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedChauffeur?.id],
    queryFn: () => api.get('/messages/chauffeur/${selectedChauffeur?.id}`).then(r => r.data),
    enabled: !!selectedChauffeur?.id,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: () => axios.post(`${API}/messages`, {
      chauffeurId: selectedChauffeur?.id,
      contenu: message,
      expediteur: 'GERANT',
    }),
    onSuccess: () => {
      setMessage('');
      qc.invalidateQueries({ queryKey: ['messages', selectedChauffeur?.id] });
      qc.invalidateQueries({ queryKey: ['messages-conversations'] });
    },
  });

  // Envoyer à plusieurs chauffeurs
  const sendMultiMutation = useMutation({
    mutationFn: async () => {
      for (const chId of selectedChauffeurs) {
        await axios.post(`${API}/messages`, { chauffeurId: chId, contenu: newMsg, expediteur: 'GERANT' });
      }
    },
    onSuccess: () => {
      setNewMsg('');
      setSelectedChauffeurs([]);
      setShowNew(false);
      qc.invalidateQueries({ queryKey: ['messages-conversations'] });
    },
  });

  const convList = Array.isArray(conversations) ? conversations : [];
  const filteredConvs = convList.filter((c: any) =>
    !search || c.chauffeur?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const msgList = Array.isArray(messages) ? messages : [];
  const chauffeursList = Array.isArray(chauffeurs) ? chauffeurs : [];

  return (
    <div className="flex h-[calc(100vh-130px)]">
      {/* Liste conversations */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold flex items-center gap-2"><MessageSquare size={20} /> Messages</h1>
            <button onClick={() => setShowNew(true)}
              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" title="Nouveau message">
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map((c: any) => (
            <button key={c.chauffeurId || c.id} onClick={() => setSelectedChauffeur(c.chauffeur || c)}
              className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b ${
                selectedChauffeur?.id === (c.chauffeur?.id || c.id) ? 'bg-primary/10 border-l-2 border-l-primary' : ''
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><User size={18} className="text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.chauffeur?.nom || 'Chauffeur'}</p>
                  <p className="text-xs text-gray-400 truncate">{c.lastMessage || c.chauffeur?.codeAcces || 'Pas de message'}</p>
                </div>
                {c.nonLu > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{c.nonLu}</span>}
              </div>
            </button>
          ))}
          {filteredConvs.length === 0 && <p className="text-gray-400 text-center py-8">Aucune conversation</p>}
        </div>
      </div>

      {/* Zone chat ou Nouveau message */}
      {showNew ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><Plus size={18} /> Nouveau message</h2>
            <button onClick={() => { setShowNew(false); setSelectedChauffeurs([]); setNewMsg(''); }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
          </div>
          <div className="p-4">
            <label className="text-xs text-gray-500 mb-2 block">Destinataires</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedChauffeurs.map(chId => {
                const ch = chauffeursList.find((c: any) => c.id === chId);
                return (
                  <span key={chId} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {ch?.nom || chId}
                    <button onClick={() => setSelectedChauffeurs(prev => prev.filter(id => id !== chId))}><X size={12} /></button>
                  </span>
                );
              })}
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-lg dark:border-gray-600 mb-4">
              {chauffeursList.map((ch: any) => (
                <label key={ch.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                  <input type="checkbox" checked={selectedChauffeurs.includes(ch.id)}
                    onChange={() => setSelectedChauffeurs(prev => prev.includes(ch.id) ? prev.filter(id => id !== ch.id) : [...prev, ch.id])}
                    className="accent-primary" />
                  <span className="text-sm">{ch.nom} <span className="text-xs text-gray-400">({ch.codeAcces})</span></span>
                </label>
              ))}
            </div>
            <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)}
              placeholder="Votre message..." rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 resize-none mb-3" />
            <button onClick={() => { if (newMsg.trim() && selectedChauffeurs.length > 0) sendMultiMutation.mutate(); }}
              disabled={!newMsg.trim() || selectedChauffeurs.length === 0 || sendMultiMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Send size={16} /> {sendMultiMutation.isPending ? 'Envoi...' : `Envoyer à ${selectedChauffeurs.length} chauffeur(s)`}
            </button>
          </div>
        </div>
      ) : selectedChauffeur ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><User size={18} className="text-primary" /></div>
            <div><p className="font-medium">{selectedChauffeur.nom}</p><p className="text-xs text-gray-400">{selectedChauffeur.codeAcces}</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgList.map((m: any) => (
              <div key={m.id} className={`flex ${m.expediteur === 'GERANT' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.expediteur === 'GERANT' ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 dark:bg-gray-700 rounded-bl-md'}`}>
                  <p>{m.contenu}</p>
                  <p className={`text-[10px] mt-1 ${m.expediteur === 'GERANT' ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(m.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {msgList.length === 0 && <p className="text-gray-400 text-center py-8">Aucun message. Dites bonjour ! 👋</p>}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (message.trim()) sendMutation.mutate(); }}
            className="p-4 border-t flex gap-3">
            <input type="text" value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Votre message..." disabled={sendMutation.isPending}
              className="flex-1 px-4 py-2 border rounded-full text-sm dark:bg-gray-700 dark:border-gray-600" />
            <button type="submit" disabled={!message.trim() || sendMutation.isPending}
              className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"><Send size={18} /></button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p>Sélectionnez un chauffeur ou créez un nouveau message</p>
            <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
              <Plus size={16} className="inline mr-1" /> Nouveau message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

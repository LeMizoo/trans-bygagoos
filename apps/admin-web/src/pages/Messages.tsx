import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MessageCircle, Send, Plus, User, Clock } from 'lucide-react';

const API = 'http://localhost:3000/api/v1';

export default function Messages() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConv, setShowNewConv] = useState(false);
  const [sujet, setSujet] = useState('');
  const [contenu, setContenu] = useState('');
  const [chauffeurSearch, setChauffeurSearch] = useState('');
  const queryClient = useQueryClient();

  // Récupérer les conversations
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axios.get(`${API}/conversations`).then(r => r.data),
    refetchInterval: 10000,
  });

  // Récupérer une conversation spécifique
  const { data: conversation } = useQuery({
    queryKey: ['conversation', selectedId],
    queryFn: () => axios.get(`${API}/conversations/${selectedId}`).then(r => r.data),
    enabled: !!selectedId,
    refetchInterval: 5000,
  });

  // Récupérer les chauffeurs pour nouvelle conversation
  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs'],
    queryFn: () => axios.get(`${API}/chauffeurs`).then(r => r.data),
    enabled: showNewConv,
  });

  // Envoyer un message
  const sendMessage = useMutation({
    mutationFn: () =>
      axios.post(`${API}/conversations/${selectedId}/messages`, { contenu: newMessage }),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
    },
  });

  // Créer une nouvelle conversation
  const createConversation = useMutation({
    mutationFn: (data: { sujet: string; contenu: string; chauffeurIds: string[] }) =>
      axios.post(`${API}/conversations`, data),
    onSuccess: () => {
      setShowNewConv(false);
      setSujet('');
      setContenu('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Marquer comme lu
  const marquerLu = useMutation({
    mutationFn: (messageId: string) =>
      axios.put(`${API}/conversations/${selectedId}/messages/${messageId}/lu`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
    },
  });

  const messages = conversation?.messages || [];
  const participants = conversation?.participants || [];

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Liste des conversations */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold">Messages</h2>
          <button
            onClick={() => setShowNewConv(true)}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations?.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full p-4 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                selectedId === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm truncate">{conv.sujet}</span>
                {conv._count?.messages > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {conv._count.messages}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {conv.messages[0]?.contenu || 'Aucun message'}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Clock size={12} />
                {new Date(conv.updatedAt).toLocaleString('fr')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedId ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{conversation?.sujet}</h3>
                <p className="text-xs text-gray-500">
                  {participants.map((p: any) => p.chauffeur?.nom || p.user?.nom).join(', ')}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  conversation?.statut === 'OUVERT'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {conversation?.statut}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.expediteurType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-xl ${
                      msg.expediteurType === 'ADMIN'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p className="text-sm">{msg.contenu}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString('fr', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!msg.lu && msg.expediteurType === 'CHAUFFEUR' && (
                        <button
                          onClick={() => marquerLu.mutate(msg.id)}
                          className="text-xs opacity-70 hover:opacity-100"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newMessage.trim()) sendMessage.mutate();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>Sélectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal nouvelle conversation */}
      {showNewConv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Nouvelle conversation</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createConversation.mutate({
                  sujet,
                  contenu,
                  chauffeurIds: chauffeurSearch
                    ? [chauffeurSearch]
                    : [],
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-sm font-medium">Sujet</label>
                <input
                  type="text"
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Chauffeur</label>
                <select
                  value={chauffeurSearch}
                  onChange={(e) => setChauffeurSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  required
                >
                  <option value="">Sélectionner un chauffeur</option>
                  {chauffeurs?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewConv(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

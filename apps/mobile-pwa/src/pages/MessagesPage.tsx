import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Send, ArrowLeft } from 'lucide-react';

import { API_URL } from '../lib/api';
const API = API_URL;
function getToken() { return localStorage.getItem('chauffeur-token'); }
function getChauffeur() { return JSON.parse(localStorage.getItem('chauffeur') || '{}'); }

export function MessagesPage() {
  const chauffeur = getChauffeur();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: messages } = useQuery({
    queryKey: ['messages', chauffeur?.id],
    queryFn: () => axios.get(`${API}/messages/chauffeur/${chauffeur?.id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.data),
    enabled: !!chauffeur?.id,
    refetchInterval: 3000,
  });

  const sendMsg = useMutation({
    mutationFn: () => axios.post(`${API}/messages`, {
      chauffeurId: chauffeur.id,
      contenu: message,
      expediteur: 'CHAUFFEUR',
    }, { headers: { Authorization: `Bearer ${getToken()}` } }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', chauffeur?.id] });
    },
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: 16, background: '#1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/dashboard" style={{ color: '#94a3b8' }}><ArrowLeft size={20} /></a>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Messages</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages?.map((m: any) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.expediteur === 'CHAUFFEUR' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: 16,
              background: m.expediteur === 'CHAUFFEUR' ? '#e94560' : '#1e293b',
              color: m.expediteur === 'CHAUFFEUR' ? '#fff' : '#e2e8f0',
              fontSize: 14,
              borderBottomRightRadius: m.expediteur === 'CHAUFFEUR' ? 4 : 16,
              borderBottomLeftRadius: m.expediteur === 'ADMIN' ? 4 : 16,
            }}>
              {m.contenu}
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                {new Date(m.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 12, background: '#1e293b', display: 'flex', gap: 8 }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Votre message..."
          style={{ flex: 1, padding: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 24, color: '#fff', fontSize: 14, outline: 'none' }}
        />
        <button onClick={() => sendMsg.mutate()} disabled={!message}
          style={{ width: 44, height: 44, borderRadius: '50%', background: '#e94560', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !message ? 0.5 : 1 }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://bygagoos-backend.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');

export default function MessagesPage() {
  const c = chauffeur();
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', c?.id],
    queryFn: () => axios.get(`${API}/messages/chauffeur/${c?.id}`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data),
    enabled: !!c?.id,
    refetchInterval: 10000,
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) => axios.post(`${API}/messages`, {
      chauffeurId: c?.id,
      contenu: msg,
      emetteur: 'CHAUFFEUR',
    }, { headers: { Authorization: `Bearer ${tk()}` } }),
    onSuccess: () => {
      setMessage('');
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
      <div className="card" style={{ marginBottom: 8 }}>
        <div className="card-title">💬 Messages</div>
        <p style={{ fontSize: 11, color: '#888' }}>Échangez avec l'administration</p>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {Array.isArray(messages) && messages.map((m: any) => (
          <div key={m.id} style={{
            display: 'flex',
            justifyContent: m.emetteur === 'CHAUFFEUR' ? 'flex-end' : 'flex-start',
            marginBottom: 8,
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: 16,
              background: m.emetteur === 'CHAUFFEUR' ? '#DAA520' : '#333',
              color: m.emetteur === 'CHAUFFEUR' ? '#000' : '#fff',
              fontSize: 13,
              borderBottomRightRadius: m.emetteur === 'CHAUFFEUR' ? 4 : 16,
              borderBottomLeftRadius: m.emetteur === 'CHAUFFEUR' ? 16 : 4,
            }}>
              <div>{m.contenu}</div>
              <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                {new Date(m.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {(!messages || messages.length === 0) && (
          <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>Aucun message. Dites bonjour ! 👋</p>
        )}
      </div>

      <form onSubmit={e => { e.preventDefault(); if (message.trim()) sendMutation.mutate(message); }}
        style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #333' }}>
        <input type="text" value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Votre message..." disabled={sendMutation.isPending}
          style={{ flex: 1, padding: 12, background: '#252525', border: '1px solid #333', borderRadius: 25, color: '#fff', fontSize: 13, outline: 'none' }} />
        <button type="submit" disabled={!message.trim() || sendMutation.isPending}
          style={{ padding: '12px 20px', background: '#DAA520', color: '#000', border: 'none', borderRadius: 25, fontWeight: 600, cursor: 'pointer', opacity: message.trim() ? 1 : 0.5 }}>
          ➤
        </button>
      </form>
    </div>
  );
}

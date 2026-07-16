import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

export function SocketTest() {
  const [livreurId, setLivreurId] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const socket = useSocket(livreurId);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('commande:new', (cmd: any) => {
      setNotifications(prev => [`📦 Nouvelle: ${cmd.clientNom}`, ...prev]);
    });

    socket.on('commande:assignee', (cmd: any) => {
      setNotifications(prev => [`🎯 Assignée: ${cmd.clientNom}`, ...prev]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('commande:new');
      socket.off('commande:assignee');
    };
  }, [socket]);

  const demanderPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      alert(`Permission: ${permission}`);
    }
  };

  return (
    <div style={{ padding: 20, color: 'white', background: '#1a1a2e', minHeight: '100vh' }}>
      <h2>🔌 Test Socket.IO</h2>
      <p>Statut: <span style={{ color: isConnected ? '#00ff88' : '#ff4444' }}>
        {isConnected ? '✅ Connecté' : '❌ Déconnecté'}
      </span></p>

      <input
        type="text"
        placeholder="ID du livreur"
        value={livreurId}
        onChange={(e) => setLivreurId(e.target.value)}
        style={{ padding: 8, margin: '10px 0', width: '100%', borderRadius: 6, border: 'none' }}
      />

      <button onClick={demanderPermission}
        style={{ padding: 10, margin: '10px 0', background: '#6c63ff', color: 'white', border: 'none', borderRadius: 6 }}>
        🔔 Demander permission notifications
      </button>

      <h3>📋 Notifications reçues :</h3>
      <div style={{ maxHeight: 300, overflow: 'auto' }}>
        {notifications.map((n, i) => (
          <div key={i} style={{ padding: 8, margin: 4, background: '#16213e', borderRadius: 6 }}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

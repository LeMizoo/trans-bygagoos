import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export function useSocket(livreurId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/livraisons`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connecté au serveur Socket.IO');

      if (livreurId) {
        socket.emit('livreur:online', { livreurId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [livreurId]);

  return socketRef.current;
}

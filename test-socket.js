const { io } = require('socket.io-client');

const socket = io('http://localhost:3000/livraisons', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Connecté au serveur Socket.IO');
  console.log('ID:', socket.id);
  
  // Simuler un livreur en ligne
  socket.emit('livreur:online', { livreurId: 'livreur-test-123' });
  console.log('📡 Envoyé: livreur:online');
});

socket.on('commande:new', (cmd) => {
  console.log('📦 Nouvelle commande reçue:', JSON.stringify(cmd, null, 2));
});

socket.on('commande:updated', (cmd) => {
  console.log('🔄 Commande mise à jour:', JSON.stringify(cmd, null, 2));
});

socket.on('commande:assignee', (cmd) => {
  console.log('🎯 Commande assignée:', JSON.stringify(cmd, null, 2));
});

socket.on('disconnect', () => {
  console.log('❌ Déconnecté');
});

// Quitter après 30 secondes
setTimeout(() => {
  console.log('⏰ Fin du test');
  socket.disconnect();
  process.exit(0);
}, 30000);

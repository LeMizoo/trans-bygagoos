import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST'] },
  namespace: '/livraisons',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private livreursEnLigne = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`🔌 Livreur connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.livreursEnLigne.delete(client.id);
    console.log(`❌ Livreur déconnecté: ${client.id}`);
  }

  @SubscribeMessage('livreur:online')
  handleLivreurOnline(client: Socket, payload: { livreurId: string }) {
    this.livreursEnLigne.set(client.id, payload.livreurId);
    client.join(`livreur:${payload.livreurId}`);
    console.log(`🟢 Livreur ${payload.livreurId} en ligne`);
  }

  nouvelleCommande(commande: any) {
    this.server.emit('commande:new', commande);
  }

  commandeUpdated(commande: any) {
    this.server.emit('commande:updated', commande);
  }

  notifierLivreur(livreurId: string, event: string, data: any) {
    this.server.to(`livreur:${livreurId}`).emit(event, data);
  }
}

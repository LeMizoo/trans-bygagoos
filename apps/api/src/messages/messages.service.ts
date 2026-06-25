import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findByChauffeur(chauffeurId: string) {
    return this.prisma.message.findMany({
      where: { chauffeurId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async send(chauffeurId: string, contenu: string, expediteur: string) {
    return this.prisma.message.create({
      data: { chauffeurId, contenu, expediteur },
    });
  }

  async getConversations() {
    // Récupérer tous les chauffeurs qui ont des messages
    const chauffeursWithMessages = await this.prisma.chauffeur.findMany({
      where: {
        messages: { some: {} }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return chauffeursWithMessages.map(c => ({
      chauffeur: { id: c.id, nom: c.nom, codeAcces: c.codeAcces },
      lastMessage: c.messages[0]?.contenu || '',
      lastDate: c.messages[0]?.createdAt || new Date(),
      nonLu: 0,
    }));
  }
}

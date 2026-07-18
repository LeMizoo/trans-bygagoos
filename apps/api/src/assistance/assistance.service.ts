import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssistanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    userId?: string;
    statut?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.statut) where.statut = params.statut;
    if (params.type) where.type = params.type;
    if (params.startDate && params.endDate) {
      where.createdAt = { gte: params.startDate, lte: params.endDate };
    }

    return this.prisma.assistance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true,
            codeAcces: true,
            flotte: { select: { nom: true } },
            cooperative: { select: { nom: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.assistance.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true,
            codeAcces: true,
          }
        }
      }
    });
    if (!ticket) throw new NotFoundException('Ticket d\'assistance non trouvé');
    return ticket;
  }

  async create(data: {
    type: 'PANNE' | 'ACCIDENT' | 'QUESTION' | 'AUTRE';
    message: string;
    userId: string;
  }) {
    const ticket = await this.prisma.assistance.create({
      data: {
        type: data.type,
        message: data.message,
        statut: 'EN_ATTENTE',
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            codeAcces: true,
          }
        }
      }
    });

    console.log(`🆘 Ticket assistance créé par ${ticket.user.nom} ${ticket.user.prenom}: ${data.type}`);
    
    // Créer un log
    await this.prisma.log.create({
      data: {
        action: 'ASSISTANCE_CREATED',
        details: `Ticket ${data.type} - ${data.message.substring(0, 50)}...`,
        userId: data.userId,
      }
    });

    return ticket;
  }

  async respond(id: string, reponse: string, userId?: string) {
    const ticket = await this.prisma.assistance.findUnique({
      where: { id },
    });

    if (!ticket) throw new NotFoundException('Ticket non trouvé');

    const updated = await this.prisma.assistance.update({
      where: { id },
      data: {
        reponse,
        statut: 'TRAITE',
      },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          }
        }
      }
    });

    console.log(`✅ Ticket #${id} traité - Réponse envoyée à ${updated.user.nom} ${updated.user.prenom}`);

    // Loguer la réponse
    await this.prisma.log.create({
      data: {
        action: 'ASSISTANCE_TRAITE',
        details: `Ticket #${id} traité`,
        userId: userId || ticket.userId,
      }
    });

    return updated;
  }

  async updateStatus(id: string, statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITE' | 'FERME') {
    const ticket = await this.prisma.assistance.findUnique({
      where: { id },
    });

    if (!ticket) throw new NotFoundException('Ticket non trouvé');

    return this.prisma.assistance.update({
      where: { id },
      data: { statut },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          }
        }
      }
    });
  }

  async getStats() {
    const [total, enAttente, enCours, traite, ferme] = await Promise.all([
      this.prisma.assistance.count(),
      this.prisma.assistance.count({ where: { statut: 'EN_ATTENTE' } }),
      this.prisma.assistance.count({ where: { statut: 'EN_COURS' } }),
      this.prisma.assistance.count({ where: { statut: 'TRAITE' } }),
      this.prisma.assistance.count({ where: { statut: 'FERME' } }),
    ]);

    // Tickets par type
    const types = await this.prisma.assistance.groupBy({
      by: ['type'],
      _count: true,
    });

    const ticketsByType = {};
    types.forEach(t => {
      ticketsByType[t.type] = t._count;
    });

    return {
      total,
      enAttente,
      enCours,
      traite,
      ferme,
      ticketsByType,
    };
  }

  async getTicketsByUser(userId: string) {
    return this.prisma.assistance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

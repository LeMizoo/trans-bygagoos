import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PointagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pointage.findMany({
      include: { chauffeur: true },
      orderBy: { datePointage: 'desc' },
    });
  }

  async findByChauffeur(chauffeurId: string) {
    return this.prisma.pointage.findMany({
      where: { chauffeurId },
      orderBy: { datePointage: 'desc' },
      take: 20,
    });
  }

  async pointer(chauffeurId: string, type: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    if (!chauffeur.actif) throw new ForbiddenException('Compte désactivé');

    // Si FIN_SERVICE, créer un versement automatique et vérifier blocage
    if (type === 'FIN_SERVICE') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const caNetJour = await this.prisma.course.aggregate({
        _sum: { gainNet: true },
        where: { chauffeurId, createdAt: { gte: today } },
      });

      const gainNetJour = caNetJour._sum.gainNet || 0;

      // Créer un versement automatique si CA > 0
      if (gainNetJour > 0) {
        await this.prisma.versement.create({
          data: {
            chauffeurId,
            montantDu: gainNetJour,
            montantVerse: 0,
            statut: 'EN_ATTENTE',
          },
        });
      }

      // Vérifier les impayés et bloquer si >= 3
      const nbImpayes = await this.prisma.versement.count({
        where: {
          chauffeurId,
          statut: 'EN_ATTENTE',
          montantDu: { gt: 0 },
          montantVerse: 0,
        },
      });

      if (nbImpayes >= 3) {
        await this.prisma.chauffeur.update({
          where: { id: chauffeurId },
          data: { actif: false },
        });

        await this.prisma.notification.create({
          data: {
            titre: '🚫 Compte bloqué',
            message: `Bonjour ${chauffeur.nom}, votre compte a été bloqué car vous avez 3 versements impayés. Contactez l'administration.`,
            type: 'BLOQUAGE',
          },
        });
      }
    }

    // Mise à jour du statut
    const statutMap: Record<string, string> = {
      ARRIVEE: 'EN_SERVICE',
      PAUSE: 'EN_PAUSE',
      REPRISE: 'EN_SERVICE',
      FIN_SERVICE: 'HORS_SERVICE',
    };

    const nouveauStatut = statutMap[type] || chauffeur.statut;

    await this.prisma.chauffeur.update({
      where: { id: chauffeurId },
      data: { statut: nouveauStatut },
    });

    const pointage = await this.prisma.pointage.create({
      data: { chauffeurId, type },
      include: { chauffeur: true },
    });

    const messages: Record<string, string> = {
      ARRIVEE: '✅ Départ enregistré ! Bonne journée 🏍️',
      PAUSE: '⏸️ Pause enregistrée',
      REPRISE: '🔄 Reprise enregistrée',
      FIN_SERVICE: '🏁 Service terminé. À demain !',
    };

    return {
      ...pointage,
      message: messages[type] || 'Pointage enregistré',
      nouveauStatut,
    };
  }
}

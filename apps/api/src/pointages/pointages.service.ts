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

    // Vérifier si une arrivée existe déjà aujourd'hui pour ce chauffeur
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === 'ARRIVEE') {
      const dejaArrive = await this.prisma.pointage.findFirst({
        where: {
          chauffeurId,
          type: 'ARRIVEE',
          datePointage: { gte: today },
        },
      });

      if (dejaArrive) {
        // Déjà pointé aujourd'hui, mais on laisse repasser pour réactiver
        await this.prisma.chauffeur.update({
          where: { id: chauffeurId },
          data: { statut: 'EN_SERVICE' },
        });
        return { ...dejaArrive, message: '✅ Déjà en service aujourd\'hui. Bonne continuation !' };
      }
    }

    // Mise à jour du statut selon le type
    const statutMap: Record<string, string> = {
      ARRIVEE: 'EN_SERVICE',
      PAUSE: 'EN_PAUSE',
      REPRISE: 'EN_SERVICE',
      FIN_SERVICE: 'HORS_SERVICE',
    };

    await this.prisma.chauffeur.update({
      where: { id: chauffeurId },
      data: { statut: statutMap[type] || chauffeur.statut },
    });

    // Créer le pointage
    const pointage = await this.prisma.pointage.create({
      data: { chauffeurId, type },
      include: { chauffeur: true },
    });

    // Message personnalisé
    const messages: Record<string, string> = {
      ARRIVEE: '✅ Départ enregistré ! Bonne journée 🏍️',
      PAUSE: '⏸️ Pause enregistrée',
      REPRISE: '🔄 Reprise enregistrée',
      FIN_SERVICE: '🏁 Service terminé. À demain !',
    };

    return {
      ...pointage,
      message: messages[type] || 'Pointage enregistré',
    };
  }
}

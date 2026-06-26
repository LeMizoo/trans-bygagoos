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
    console.log(`📍 Pointage: chauffeurId=${chauffeurId}, type=${type}`);
    
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    if (!chauffeur.actif) throw new ForbiddenException('Compte désactivé');

    // Vérifier si une arrivée existe déjà aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === 'ARRIVEE') {
      const dejaArrive = await this.prisma.pointage.findFirst({
        where: { chauffeurId, type: 'ARRIVEE', datePointage: { gte: today } },
      });

      if (dejaArrive) {
        // Déjà pointé aujourd'hui, on remet EN_SERVICE
        await this.prisma.chauffeur.update({
          where: { id: chauffeurId },
          data: { statut: 'EN_SERVICE' },
        });
        console.log(`✅ ${chauffeur.nom} déjà arrivé aujourd'hui -> EN_SERVICE`);
        return { ...dejaArrive, message: '✅ Déjà en service aujourd\'hui. Bonne continuation !' };
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
    
    const updated = await this.prisma.chauffeur.update({
      where: { id: chauffeurId },
      data: { statut: nouveauStatut },
    });
    console.log(`✅ ${chauffeur.nom} : ${chauffeur.statut} -> ${updated.statut}`);

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

    return { ...pointage, message: messages[type] || 'Pointage enregistré' };
  }
}

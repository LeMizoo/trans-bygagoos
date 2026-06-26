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

    // Mise à jour FORCÉE du statut
    const statutMap: Record<string, string> = {
      ARRIVEE: 'EN_SERVICE',
      PAUSE: 'EN_PAUSE',
      REPRISE: 'EN_SERVICE',
      FIN_SERVICE: 'HORS_SERVICE',
    };

    const nouveauStatut = statutMap[type] || chauffeur.statut;

    // FORCER la mise à jour
    const updated = await this.prisma.chauffeur.update({
      where: { id: chauffeurId },
      data: { statut: nouveauStatut },
    });
    
    console.log(`📍 POINTAGE: ${chauffeur.nom} (${chauffeur.codeAcces}) - ${type} -> ${nouveauStatut} (avant: ${chauffeur.statut})`);

    // Créer le pointage
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

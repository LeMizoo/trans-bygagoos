import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (!chauffeurId) throw new NotFoundException('chauffeurId requis');

    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');

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

    return this.prisma.pointage.create({
      data: { chauffeurId, type },
      include: { chauffeur: true },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VersementsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.versement.findMany({
      include: { chauffeur: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByChauffeur(chauffeurId: string) {
    return this.prisma.versement.findMany({
      where: { chauffeurId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { chauffeurId: string; montantVerse: number }) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: data.chauffeurId },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');

    const versement = await this.prisma.versement.create({
      data: {
        chauffeurId: data.chauffeurId,
        montantDu: chauffeur.solde,
        montantVerse: data.montantVerse,
        statut: 'EN_ATTENTE',
      },
    });

    return versement;
  }

  async valider(id: string) {
    const versement = await this.prisma.versement.update({
      where: { id },
      data: { statut: 'VALIDE' },
    });

    // Mise à jour du solde chauffeur
    await this.prisma.chauffeur.update({
      where: { id: versement.chauffeurId },
      data: { solde: { decrement: versement.montantVerse } },
    });

    return versement;
  }

  async refuser(id: string) {
    return this.prisma.versement.update({
      where: { id },
      data: { statut: 'REFUSE' },
    });
  }
}

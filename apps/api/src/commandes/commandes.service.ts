import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommandesService {
  constructor(private prisma: PrismaService) {}

  async findAll(coopId: string) {
    return this.prisma.commande.findMany({
      where: { coopId },
      include: { livreur: true, vehicule: true },
      orderBy: { dateCreation: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.commande.findUnique({
      where: { id },
      include: { livreur: true, vehicule: true, coop: true },
    });
  }

  async create(data: any) {
    return this.prisma.commande.create({ data, include: { livreur: true, vehicule: true } });
  }

  async update(id: string, data: any) {
    return this.prisma.commande.update({ where: { id }, data, include: { livreur: true, vehicule: true } });
  }

  async assignLivreur(id: string, livreurId: string, vehiculeId: string) {
    return this.prisma.commande.update({
      where: { id },
      data: {
        livreurId,
        vehiculeId,
        statut: 'ASSIGNEE',
        datePriseEnCharge: new Date(),
      },
      include: { livreur: true, vehicule: true },
    });
  }

  async updateStatut(id: string, statut: string) {
    const data: any = { statut };
    if (statut === 'LIVREE') data.dateLivraison = new Date();
    return this.prisma.commande.update({ where: { id }, data, include: { livreur: true } });
  }

  async findByLivreur(livreurId: string) {
    return this.prisma.commande.findMany({
      where: { livreurId },
      include: { coop: true },
      orderBy: { dateCreation: 'desc' },
    });
  }
}

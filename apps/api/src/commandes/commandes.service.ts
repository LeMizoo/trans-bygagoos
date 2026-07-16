import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class CommandesService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

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
    const commande = await this.prisma.commande.create({
      data,
      include: { livreur: true, vehicule: true },
    });
    this.socketGateway.nouvelleCommande(commande);
    return commande;
  }

  async update(id: string, data: any) {
    const commande = await this.prisma.commande.update({
      where: { id },
      data,
      include: { livreur: true, vehicule: true },
    });
    this.socketGateway.commandeUpdated(commande);
    return commande;
  }

  async assignLivreur(id: string, livreurId: string, vehiculeId: string) {
    const commande = await this.prisma.commande.update({
      where: { id },
      data: {
        livreurId,
        vehiculeId,
        statut: 'ASSIGNEE',
        datePriseEnCharge: new Date(),
      },
      include: { livreur: true, vehicule: true },
    });
    this.socketGateway.notifierLivreur(livreurId, 'commande:assignee', commande);
    this.socketGateway.commandeUpdated(commande);
    return commande;
  }

  async updateStatut(id: string, statut: string) {
    const data: any = { statut };
    if (statut === 'LIVREE') data.dateLivraison = new Date();
    const commande = await this.prisma.commande.update({
      where: { id },
      data,
      include: { livreur: true },
    });
    this.socketGateway.commandeUpdated(commande);
    return commande;
  }

  async findByLivreur(livreurId: string) {
    return this.prisma.commande.findMany({
      where: { livreurId },
      include: { coop: true },
      orderBy: { dateCreation: 'desc' },
    });
  }
}

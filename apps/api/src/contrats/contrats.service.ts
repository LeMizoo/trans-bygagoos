import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContratsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.contrat.findMany({
      include: { chauffeur: true, moto: true },
      orderBy: { dateDebut: 'desc' },
    });
  }

  async create(data: {
    chauffeurId: string;
    motoId: string;
    type: string;
    montantLocation: number;
    dateDebut: string;
  }) {
    return this.prisma.contrat.create({
      data: {
        ...data,
        dateDebut: new Date(data.dateDebut),
        statut: 'ACTIF',
      },
      include: { chauffeur: true, moto: true },
    });
  }

  async terminer(id: string) {
    return this.prisma.contrat.update({
      where: { id },
      data: { statut: 'TERMINE', dateFin: new Date() },
    });
  }

  async resilier(id: string) {
    return this.prisma.contrat.update({
      where: { id },
      data: { statut: 'RESILIE', dateFin: new Date() },
    });
  }
}

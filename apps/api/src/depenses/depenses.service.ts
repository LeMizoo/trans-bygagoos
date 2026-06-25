import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepensesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.depense.findMany({
      include: { moto: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: { description: string; montant: number; categorie: string; motoId?: string }) {
    return this.prisma.depense.create({ data });
  }

  async stats() {
    const total = await this.prisma.depense.aggregate({
      _sum: { montant: true },
    });

    const parCategorie = await this.prisma.depense.groupBy({
      by: ['categorie'],
      _sum: { montant: true },
    });

    return {
      totalDepenses: total._sum.montant || 0,
      parCategorie,
    };
  }
}

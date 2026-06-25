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

  async create(data: { 
    description: string; 
    montant: number; 
    categorie: string; 
    motoId?: string;
    litres?: number;
    station?: string;
  }) {
    return this.prisma.depense.create({
      data: {
        description: data.description,
        montant: data.montant,
        categorie: data.categorie,
        motoId: data.motoId,
      },
    });
  }

  async stats() {
    const [total, parCategorie] = await Promise.all([
      this.prisma.depense.aggregate({ _sum: { montant: true } }),
      this.prisma.depense.groupBy({ by: ['categorie'], _sum: { montant: true } }),
    ]);

    return {
      totalDepenses: total._sum.montant || 0,
      parCategorie,
    };
  }
}

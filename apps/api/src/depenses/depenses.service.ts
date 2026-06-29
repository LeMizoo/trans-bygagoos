import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, categorie?: string) {
    const where: any = {};
    if (categorie && categorie !== 'tous') where.categorie = categorie;
    
    const [total, items] = await Promise.all([
      this.prisma.depense.count({ where }),
      this.prisma.depense.findMany({
        where,
        include: { moto: { select: { immatriculation: true } } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async create(data: {
    description: string; montant: number; categorie: string;
    motoId?: string;  litres?: number; station?: string;
  }) {
    return this.prisma.depense.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.depense.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.depense.delete({ where: { id } });
  }

  async stats(periode: string = 'mois') {
    const now = new Date();
    let dateDebut: Date;
    
    if (periode === 'jour') {
      dateDebut = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (periode === 'semaine') {
      const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
      dateDebut = new Date(now);
      dateDebut.setDate(dateDebut.getDate() - diff);
      dateDebut.setHours(0, 0, 0, 0);
    } else {
      dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [total, parCategorie, parJour] = await Promise.all([
      this.prisma.depense.aggregate({ _sum: { montant: true }, where: { date: { gte: dateDebut } } }),
      this.prisma.depense.groupBy({ by: ['categorie'], _sum: { montant: true }, where: { date: { gte: dateDebut } } }),
      this.prisma.depense.groupBy({ by: ['date'], _sum: { montant: true }, where: { date: { gte: dateDebut } }, orderBy: { date: 'asc' } }),
    ]);

    return {
      totalDepenses: total._sum.montant || 0,
      parCategorie: parCategorie.map(c => ({
        categorie: c.categorie,
        montant: c._sum.montant || 0,
        label: labels[c.categorie] || c.categorie,
      })),
      parJour: parJour.map(j => ({
        date: j.date.toISOString().split('T')[0],
        montant: j._sum.montant || 0,
      })),
      periode,
    };
  }
}

const labels: Record<string, string> = {
  CARBURANT: '⛽ Carburant',
  ENTRETIEN: '🔧 Entretien',
  PIECE: '🔩 Pièces',
  ASSURANCE: '🛡️ Assurance',
  PNEU: '🛞 Pneu',
  REPARATION: '🔨 Réparation',
  AUTRE: '📝 Autre',
};

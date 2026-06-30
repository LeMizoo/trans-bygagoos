import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, categorie?: string, flotteId?: string) {
    const where: any = {};
    if (categorie && categorie !== 'tous') where.categorie = categorie;
    if (flotteId) where.flotteId = flotteId;
    const [total, items] = await Promise.all([
      this.prisma.depense.count({ where }),
      this.prisma.depense.findMany({ where, include: { moto: { select: { immatriculation: true } } }, orderBy: { date: 'desc' }, skip: (page - 1) * limit, take: limit }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async findByChauffeur(chauffeurId: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({ where: { id: chauffeurId }, select: { motoId: true } });
    if (!chauffeur?.motoId) return { items: [], total: 0 };
    const items = await this.prisma.depense.findMany({ where: { motoId: chauffeur.motoId }, orderBy: { date: 'desc' } });
    return { items, total: items.length };
  }

  async create(data: any) {
    const clean: any = { description: data.description, montant: parseFloat(data.montant) || 0, categorie: data.categorie || 'AUTRE' };
    if (data.motoId) clean.motoId = data.motoId;
    if (data.litres) clean.litres = parseFloat(data.litres);
    if (data.station) clean.station = data.station;
    return this.prisma.depense.create({ data: clean });
  }

  async update(id: string, data: any) { return this.prisma.depense.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.depense.delete({ where: { id } }); }

  async stats(periode = 'mois') {
    const now = new Date();
    let dateDebut: Date;
    if (periode === 'jour') dateDebut = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (periode === 'semaine') { const diff = now.getDay() === 0 ? 6 : now.getDay() - 1; dateDebut = new Date(now); dateDebut.setDate(dateDebut.getDate() - diff); dateDebut.setHours(0, 0, 0, 0); }
    else dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
    const where = { date: { gte: dateDebut } };
    const [total, parCategorie] = await Promise.all([
      this.prisma.depense.aggregate({ _sum: { montant: true }, where }),
      this.prisma.depense.groupBy({ by: ['categorie'], _sum: { montant: true }, where }),
    ]);
    const labels: Record<string, string> = { CARBURANT: '⛽ Carburant', ENTRETIEN: '🔧 Entretien', PIECE: '🔩 Pièces', ASSURANCE: '🛡️ Assurance', PNEU: '🛞 Pneu', REPARATION: '🔨 Réparation', AUTRE: '📝 Autre' };
    return {
      totalDepenses: total._sum.montant || 0,
      parCategorie: parCategorie.map(c => ({ categorie: c.categorie, montant: c._sum.montant || 0, label: labels[c.categorie] || c.categorie })),
      periode,
    };
  }
}

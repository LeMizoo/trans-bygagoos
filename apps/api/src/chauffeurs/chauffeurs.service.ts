import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChauffeursService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, flotteId?: string) {
    const where: any = {};
    if (flotteId) where.flotteId = flotteId;
    if (search) where.OR = [{ nom: { contains: search } }, { codeAcces: { contains: search } }];
    return this.prisma.chauffeur.findMany({ where, include: { moto: true, flotte: true }, orderBy: { nom: 'asc' } });
  }

  async findOne(id: string) {
    const c = await this.prisma.chauffeur.findUnique({ where: { id }, include: { moto: true, flotte: true } });
    if (!c) throw new NotFoundException('Chauffeur non trouvé');
    return c;
  }

  async getDashboard(chauffeurId: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({ where: { id: chauffeurId }, include: { moto: true } });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const courses = await this.prisma.course.findMany({ where: { chauffeurId, createdAt: { gte: today } } });
    const sum = (arr: any[]) => ({ count: arr.length, prix: arr.reduce((s, c) => s + (c.prix || 0), 0), commission: arr.reduce((s, c) => s + (c.commission || 0), 0), gainNet: arr.reduce((s, c) => s + (c.gainNet || 0), 0) });
    return { solde: chauffeur.solde, statut: chauffeur.statut, moto: chauffeur.moto, aujourdhui: sum(courses) };
  }

  async create(data: any) { return this.prisma.chauffeur.create({ data: { ...data, statut: 'HORS_SERVICE', solde: 0 } }); }
  async update(id: string, data: any) { return this.prisma.chauffeur.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.chauffeur.update({ where: { id }, data: { actif: false } }); }
  async toggleActif(id: string) { const c = await this.prisma.chauffeur.findUnique({ where: { id } }); return this.prisma.chauffeur.update({ where: { id }, data: { actif: !c?.actif } }); }
  async renouvelerTousCodes() { const chauffeurs = await this.prisma.chauffeur.findMany({ where: { actif: true } }); for (const c of chauffeurs) { await this.prisma.chauffeur.update({ where: { id: c.id }, data: { codeAcces: String(Math.floor(1000 + Math.random() * 9000)) } }); } return { renouveles: chauffeurs.length }; }
  async renouvelerCode(id: string) { return this.prisma.chauffeur.update({ where: { id }, data: { codeAcces: String(Math.floor(1000 + Math.random() * 9000)) } }); }
}

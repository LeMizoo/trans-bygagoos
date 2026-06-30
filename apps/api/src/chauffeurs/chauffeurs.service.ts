import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChauffeursService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, flotteId?: string) {
    await this.resetQuotidien();
    const where: any = {};
    if (flotteId) where.flotteId = flotteId;
    if (search) where.OR = [{ nom: { contains: search } }, { codeAcces: { contains: search } }];
    return this.prisma.chauffeur.findMany({ where, include: { moto: true }, orderBy: { nom: 'asc' } });
  }

  async findOne(id: string) {
    const c = await this.prisma.chauffeur.findUnique({ where: { id }, include: { moto: true } });
    if (!c) throw new NotFoundException('Chauffeur non trouvé');
    return c;
  }

  private async resetQuotidien() {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const actifs = await this.prisma.chauffeur.findMany({
      where: { statut: { not: 'HORS_SERVICE' } },
      include: { pointages: { where: { datePointage: { gte: todayStart }, type: 'ARRIVEE' }, take: 1 } },
    });
    for (const c of actifs) {
      if (c.pointages.length === 0) {
        await this.prisma.chauffeur.update({ where: { id: c.id }, data: { statut: 'HORS_SERVICE' } });
      }
    }
  }

  async getDashboard(chauffeurId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    let chauffeur = await this.prisma.chauffeur.findUnique({ where: { id: chauffeurId }, include: { moto: true } });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    
    const [coursesJour, coursesMois] = await Promise.all([
      this.prisma.course.findMany({ where: { chauffeurId, createdAt: { gte: todayStart } } }),
      this.prisma.course.findMany({ where: { chauffeurId, createdAt: { gte: monthStart } } }),
    ]);
    
    const sum = (courses: any[]) => ({
      count: courses.length,
      prix: courses.reduce((s, c) => s + (c.prix || 0), 0),
      commission: courses.reduce((s, c) => s + (c.commission || 0), 0),
      gainNet: courses.reduce((s, c) => s + (c.gainNet || 0), 0),
    });

    return {
      solde: chauffeur.solde, statut: chauffeur.statut, moto: chauffeur.moto,
      aujourdhui: sum(coursesJour), semaine: sum(coursesMois), mois: sum(coursesMois),
    };
  }

  async create(data: any) { return this.prisma.chauffeur.create({ data: { ...data, statut: 'HORS_SERVICE', solde: 0, actif: true } }); }
  async update(id: string, data: any) { return this.prisma.chauffeur.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.chauffeur.update({ where: { id }, data: { actif: false } }); }
  async toggleActif(id: string) { const c = await this.prisma.chauffeur.findUnique({ where: { id } }); if (!c) throw new NotFoundException(); return this.prisma.chauffeur.update({ where: { id }, data: { actif: !c.actif } }); }
  async renouvelerTousCodes() { const chauffeurs = await this.prisma.chauffeur.findMany({ where: { actif: true } }); for (const c of chauffeurs) { await this.prisma.chauffeur.update({ where: { id: c.id }, data: { codeAcces: String(Math.floor(1000 + Math.random() * 9000)) } }); } return { renouveles: chauffeurs.length }; }
  async renouvelerCode(id: string) { return this.prisma.chauffeur.update({ where: { id }, data: { codeAcces: String(Math.floor(1000 + Math.random() * 9000)) } }); }
}

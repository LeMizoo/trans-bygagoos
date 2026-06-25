import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChauffeursService {
  constructor(private prisma: PrismaService) {}

  async findAll(actif?: boolean) {
    const where: any = {};
    if (actif !== undefined) where.actif = actif;
    
    return this.prisma.chauffeur.findMany({
      where,
      include: { moto: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id },
      include: {
        moto: true,
        courses: { orderBy: { createdAt: 'desc' }, take: 20 },
        pointages: { orderBy: { datePointage: 'desc' }, take: 10 },
        versements: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    return chauffeur;
  }

  async updateCode(id: string, codeAcces: string) {
    const existant = await this.prisma.chauffeur.findUnique({ where: { codeAcces } });
    if (existant && existant.id !== id) throw new Error('Code déjà utilisé');
    
    return this.prisma.chauffeur.update({
      where: { id },
      data: { codeAcces },
    });
  }

  async toggleActif(id: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({ where: { id } });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    
    return this.prisma.chauffeur.update({
      where: { id },
      data: { actif: !chauffeur.actif },
    });
  }

  async renouvelerTousCodes() {
    const chauffeurs = await this.prisma.chauffeur.findMany({ where: { actif: true } });
    let count = 0;
    
    for (const c of chauffeurs) {
      const nouveauCode = String(Math.floor(1000 + Math.random() * 9000));
      await this.prisma.chauffeur.update({
        where: { id: c.id },
        data: { codeAcces: nouveauCode },
      });
      count++;
    }
    
    return { renouveles: count, total: chauffeurs.length };
  }

  async renouvelerCode(id: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({ where: { id } });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    
    const nouveauCode = String(Math.floor(1000 + Math.random() * 9000));
    return this.prisma.chauffeur.update({
      where: { id },
      data: { codeAcces: nouveauCode },
    });
  }

  async getDashboard(chauffeurId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - diff);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: { moto: true },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');

    const pointageAujourdhui = await this.prisma.pointage.findFirst({
      where: { chauffeurId, datePointage: { gte: todayStart }, type: 'ARRIVEE' },
    });

    if (!pointageAujourdhui && chauffeur.statut !== 'HORS_SERVICE') {
      await this.prisma.chauffeur.update({
        where: { id: chauffeurId },
        data: { statut: 'HORS_SERVICE' },
      });
      chauffeur.statut = 'HORS_SERVICE';
    }

    const [coursesJour, coursesSemaine, coursesMois] = await Promise.all([
      this.prisma.course.findMany({ where: { chauffeurId, createdAt: { gte: todayStart } } }),
      this.prisma.course.findMany({ where: { chauffeurId, createdAt: { gte: weekStart } } }),
      this.prisma.course.findMany({ where: { chauffeurId, createdAt: { gte: monthStart } } }),
    ]);

    const dernierPointage = await this.prisma.pointage.findFirst({
      where: { chauffeurId },
      orderBy: { datePointage: 'desc' },
    });

    const sum = (courses: any[]) => ({
      count: courses.length,
      prix: courses.reduce((s, c) => s + c.prix, 0),
      commission: courses.reduce((s, c) => s + c.commission, 0),
      gainNet: courses.reduce((s, c) => s + c.gainNet, 0),
    });

    return {
      solde: chauffeur.solde,
      statut: chauffeur.statut,
      moto: chauffeur.moto,
      dernierPointage: dernierPointage?.datePointage || null,
      aDemarreAujourdhui: !!pointageAujourdhui,
      messageStatus: !pointageAujourdhui ? 'Nouvelle journée ! Cliquez sur Départ pour commencer.' : null,
      aujourdhui: sum(coursesJour),
      semaine: sum(coursesSemaine),
      mois: sum(coursesMois),
    };
  }
}

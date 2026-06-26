import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChauffeursService {
  constructor(private prisma: PrismaService) {}

  async findAll(actif?: boolean) {
    const where: any = {};
    if (actif !== undefined) where.actif = actif;
    
    // RESET QUOTIDIEN à chaque appel de la liste
    await this.resetQuotidien();
    
    return this.prisma.chauffeur.findMany({
      where,
      include: { moto: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.chauffeur.findUnique({
      where: { id },
      include: { moto: true, courses: { orderBy: { createdAt: 'desc' }, take: 20 }, pointages: { orderBy: { datePointage: 'desc' }, take: 10 } },
    });
    if (!c) throw new NotFoundException('Chauffeur non trouvé');
    return c;
  }

  private async resetQuotidien() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    
    // Trouver TOUS les chauffeurs qui ne sont pas HORS_SERVICE
    const actifs = await this.prisma.chauffeur.findMany({
      where: {
        statut: { not: 'HORS_SERVICE' },
      },
      include: {
        pointages: {
          where: {
            datePointage: { gte: todayStart },
            type: 'ARRIVEE',
          },
          take: 1,
        },
      },
    });

    let resetCount = 0;
    for (const c of actifs) {
      // Si pas de pointage ARRIVEE aujourd'hui → HORS_SERVICE
      if (c.pointages.length === 0) {
        await this.prisma.chauffeur.update({
          where: { id: c.id },
          data: { statut: 'HORS_SERVICE' },
        });
        resetCount++;
        console.log(`🔄 Reset: ${c.nom} (${c.codeAcces}) -> HORS_SERVICE`);
      }
    }
    
    if (resetCount > 0) {
      console.log(`✅ ${resetCount} chauffeur(s) remis à HORS_SERVICE (pas de pointage aujourd'hui)`);
    }
  }

  async getDashboard(chauffeurId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Récupérer le chauffeur
    let chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: { moto: true },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');

    // Vérifier si pointage ARRIVEE aujourd'hui
    const pointageAujourdhui = await this.prisma.pointage.findFirst({
      where: {
        chauffeurId,
        type: 'ARRIVEE',
        datePointage: { gte: todayStart, lte: todayEnd },
      },
    });

    // Si pas de pointage aujourd'hui ET pas déjà HORS_SERVICE → RESET
    if (!pointageAujourdhui && chauffeur.statut !== 'HORS_SERVICE') {
      chauffeur = await this.prisma.chauffeur.update({
        where: { id: chauffeurId },
        data: { statut: 'HORS_SERVICE' },
        include: { moto: true },
      });
      console.log(`🔄 Dashboard reset: ${chauffeur.nom} -> HORS_SERVICE`);
    }

    // Courses AUJOURD'HUI uniquement
    const coursesJour = await this.prisma.course.findMany({
      where: {
        chauffeurId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    const coursesSemaine = await this.prisma.course.findMany({
      where: { chauffeurId, createdAt: { gte: weekStart } },
    });

    const coursesMois = await this.prisma.course.findMany({
      where: { chauffeurId, createdAt: { gte: monthStart } },
    });

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
      messageStatus: !pointageAujourdhui
        ? '🆕 Nouvelle journée ! Cliquez sur DÉPART pour commencer.'
        : null,
      aujourdhui: sum(coursesJour),
      semaine: sum(coursesSemaine),
      mois: sum(coursesMois),
    };
  }

  async update(id: string, data: any) {
    const { motoId, ...rest } = data;
    return this.prisma.chauffeur.update({
      where: { id },
      data: { ...rest, ...(motoId !== undefined ? { motoId: motoId || null } : {}) },
    });
  }

  async updateCode(id: string, codeAcces: string) {
    const existant = await this.prisma.chauffeur.findUnique({ where: { codeAcces } });
    if (existant && existant.id !== id) throw new Error('Code déjà utilisé');
    return this.prisma.chauffeur.update({ where: { id }, data: { codeAcces } });
  }

  async toggleActif(id: string) {
    const c = await this.prisma.chauffeur.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Chauffeur non trouvé');
    return this.prisma.chauffeur.update({ where: { id }, data: { actif: !c.actif } });
  }

  async renouvelerTousCodes() {
    const chauffeurs = await this.prisma.chauffeur.findMany({ where: { actif: true } });
    let count = 0;
    for (const c of chauffeurs) {
      await this.prisma.chauffeur.update({ where: { id: c.id }, data: { codeAcces: String(Math.floor(1000 + Math.random() * 9000)) } });
      count++;
    }
    return { renouveles: count, total: chauffeurs.length };
  }

  async renouvelerCode(id: string) {
    const c = await this.prisma.chauffeur.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Chauffeur non trouvé');
    return this.prisma.chauffeur.update({ where: { id }, data: { codeAcces: String(Math.floor(1000 + Math.random() * 9000)) } });
  }
}

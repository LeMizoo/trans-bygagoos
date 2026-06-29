import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const debutMois = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalChauffeurs, chauffeursActifs, totalMotos, totalProprietaires,
      coursesJour, caJour, caMois, depensesMois,
      versementsEnAttente, assistanceOuverte,
    ] = await Promise.all([
      this.prisma.chauffeur.count(),
      this.prisma.chauffeur.count({ where: { statut: 'EN_SERVICE' } }),
      this.prisma.moto.count(),
      this.prisma.proprietaire.count(),
      this.prisma.course.count({ where: { createdAt: { gte: today } } }),
      this.prisma.course.aggregate({ _sum: { prix: true }, where: { createdAt: { gte: today } } }),
      this.prisma.course.aggregate({ _sum: { prix: true }, where: { createdAt: { gte: debutMois } } }),
      this.prisma.depense.aggregate({ _sum: { montant: true }, where: { date: { gte: debutMois } } }),
      this.prisma.versement.count({ where: { statut: 'EN_ATTENTE' } }),
      this.prisma.assistance.count({ where: { statut: 'OUVERT' } }),
    ]);

    return {
      totalChauffeurs, chauffeursActifs, totalMotos, totalProprietaires,
      coursesJour,
      caJour: caJour._sum.prix || 0,
      caMois: caMois._sum.prix || 0,
      depensesMois: depensesMois._sum.montant || 0,
      versementsEnAttente, assistanceOuverte,
    };
  }

  async getTopChauffeurs() {
    const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const courses = await this.prisma.course.groupBy({
      by: ['chauffeurId'],
      where: { createdAt: { gte: debutMois } },
      _count: { id: true },
      _sum: { prix: true },
      orderBy: { _sum: { prix: 'desc' } },
      take: 5,
    });
    const chauffeurs = await this.prisma.chauffeur.findMany({
      where: { id: { in: courses.map((c) => c.chauffeurId) } },
      select: { id: true, nom: true },
    });
    return courses.map((c) => ({
      chauffeur: chauffeurs.find((ch) => ch.id === c.chauffeurId),
      courses: c._count.id,
      ca: c._sum.prix || 0,
    }));
  }

  async getCAjournalier(days = 7) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const [ca, depenses] = await Promise.all([
        this.prisma.course.aggregate({ _sum: { prix: true }, where: { createdAt: { gte: date, lt: nextDate } } }),
        this.prisma.depense.aggregate({ _sum: { montant: true }, where: { date: { gte: date, lt: nextDate } } }),
      ]);
      result.push({
        date: date.toISOString().split('T')[0],
        ca: ca._sum.prix || 0,
        depenses: depenses._sum.montant || 0,
      });
    }
    return result;
  }

  async getAlertesFlotte() {
    try {
      const maintenant = new Date();
      const toutesLesMotos = await this.prisma.moto.findMany({
        select: {
          immatriculation: true,
          finAssurance: true,
          finVignette: true,
          kmActuel: true,
          kmProchaineVidange: true,
        },
      });

      const assuranceExpiree = toutesLesMotos.filter(
        m => m.finAssurance && new Date(m.finAssurance) < maintenant
      ).length;

      const vignetteExpiree = toutesLesMotos.filter(
        m => m.finVignette && new Date(m.finVignette) < maintenant
      ).length;

      const vidangeProche = toutesLesMotos.filter(
        m => m.kmActuel && m.kmProchaineVidange && m.kmActuel >= m.kmProchaineVidange - 500
      ).length;

      return { assuranceExpiree, vignetteExpiree, vidangeProche };
    } catch (error) {
      return { assuranceExpiree: 0, vignetteExpiree: 0, vidangeProche: 0 };
    }
  }
}

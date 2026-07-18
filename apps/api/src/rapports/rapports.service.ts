import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RapportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalChauffeurs, totalLivreurs, totalFlottes, totalCoops,
      coursesToday, commandesToday, pointagesToday, ticketsEnAttente,
      revenusToday, notificationsNonLues,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CHAUFFEUR', statut: 'ACTIF' } }),
      this.prisma.user.count({ where: { role: 'LIVREUR', statut: 'ACTIF' } }),
      this.prisma.flotte.count({ where: { statut: 'ACTIF' } }),
      this.prisma.cooperative.count({ where: { statut: 'ACTIF' } }),
      this.prisma.course.count({ where: { dateCourse: { gte: today, lt: tomorrow } } }),
      this.prisma.commande.count({ where: { dateLivraison: { gte: today, lt: tomorrow } } }),
      this.prisma.pointage.count({ where: { date: { gte: today, lt: tomorrow } } }),
      this.prisma.assistance.count({ where: { statut: 'EN_ATTENTE' } }),
      this.prisma.course.aggregate({ _sum: { prix: true }, where: { dateCourse: { gte: today, lt: tomorrow } } }),
      this.prisma.notification.count({ where: { lu: false } }),
    ]);

    return {
      date: today.toISOString().split('T')[0],
      ressources: { chauffeurs: totalChauffeurs, livreurs: totalLivreurs, flottes: totalFlottes, cooperatives: totalCoops },
      activite: { coursesToday, commandesToday, pointagesToday },
      finances: { revenusCoursesToday: revenusToday._sum.prix || 0 },
      support: { ticketsEnAttente, notificationsNonLues },
    };
  }

  async getMonthlyRevenue(month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const courses = await this.prisma.course.findMany({
      where: { dateCourse: { gte: startDate, lte: endDate } },
      select: { prix: true, dateCourse: true },
    });

    const revenusByDay = {};
    courses.forEach(c => {
      const day = c.dateCourse.toISOString().split('T')[0];
      revenusByDay[day] = (revenusByDay[day] || 0) + c.prix;
    });

    return {
      mois: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
      totalRevenus: courses.reduce((s, c) => s + c.prix, 0),
      totalCourses: courses.length,
      revenusByDay,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChauffeursService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.chauffeur.findMany({
      include: { moto: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id },
      include: {
        moto: true,
        courses: { orderBy: { createdAt: 'desc' }, take: 10 },
        pointages: { orderBy: { datePointage: 'desc' }, take: 10 },
        versements: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    return chauffeur;
  }

  async getDashboard(chauffeurId: string) {
    const now = new Date();
    
    // Aujourd'hui
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Cette semaine (lundi)
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - diff);
    
    // Ce mois
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: { moto: true },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');

    // Courses du jour
    const coursesJour = await this.prisma.course.findMany({
      where: { chauffeurId, createdAt: { gte: todayStart } },
    });

    // Courses de la semaine
    const coursesSemaine = await this.prisma.course.findMany({
      where: { chauffeurId, createdAt: { gte: weekStart } },
    });

    // Courses du mois
    const coursesMois = await this.prisma.course.findMany({
      where: { chauffeurId, createdAt: { gte: monthStart } },
    });

    // Total all time
    const totalCourses = await this.prisma.course.aggregate({
      where: { chauffeurId },
      _sum: { prix: true, commission: true, gainNet: true },
      _count: true,
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
      aujourdhui: sum(coursesJour),
      semaine: sum(coursesSemaine),
      mois: sum(coursesMois),
      total: {
        count: totalCourses._count,
        prix: totalCourses._sum.prix || 0,
        commission: totalCourses._sum.commission || 0,
        gainNet: totalCourses._sum.gainNet || 0,
      },
    };
  }
}

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
        courses: { orderBy: { createdAt: 'desc' }, take: 20 },
        pointages: { orderBy: { datePointage: 'desc' }, take: 10 },
        versements: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    return chauffeur;
  }

  async getDashboard(chauffeurId: string) {
    const now = new Date();
    
    // Aujourd'hui (de minuit à maintenant)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Cette semaine (lundi 00:00)
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - diff);
    
    // Ce mois (1er du mois)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: { moto: true },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');

    // Récupérer toutes les courses pour les 3 périodes
    const [coursesJour, coursesSemaine, coursesMois] = await Promise.all([
      this.prisma.course.findMany({
        where: { chauffeurId, createdAt: { gte: todayStart } },
      }),
      this.prisma.course.findMany({
        where: { chauffeurId, createdAt: { gte: weekStart } },
      }),
      this.prisma.course.findMany({
        where: { chauffeurId, createdAt: { gte: monthStart } },
      }),
    ]);

    // Dernier pointage du jour pour savoir si le chauffeur a démarré
    const dernierPointage = await this.prisma.pointage.findFirst({
      where: { chauffeurId },
      orderBy: { datePointage: 'desc' },
    });

    // Vérifier si le chauffeur a pointé aujourd'hui
    const pointageAujourdhui = await this.prisma.pointage.findFirst({
      where: { 
        chauffeurId, 
        datePointage: { gte: todayStart },
        type: 'ARRIVEE',
      },
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
      dernierPointageType: dernierPointage?.type || null,
      aDemarreAujourdhui: !!pointageAujourdhui,
      aujourdhui: sum(coursesJour),
      semaine: sum(coursesSemaine),
      mois: sum(coursesMois),
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChauffeursService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Réinitialisation automatique : si pas de pointage aujourd'hui, mettre HORS_SERVICE
    await this.resetChauffeursSansPointage();
    
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

  private async resetChauffeursSansPointage() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Trouver tous les chauffeurs qui sont EN_SERVICE ou EN_PAUSE
    // mais qui n'ont pas pointé aujourd'hui
    const chauffeursActifs = await this.prisma.chauffeur.findMany({
      where: {
        statut: { in: ['EN_SERVICE', 'EN_PAUSE'] },
      },
      include: {
        pointages: {
          where: { datePointage: { gte: today } },
          take: 1,
        },
      },
    });

    // Réinitialiser ceux qui n'ont pas pointé aujourd'hui
    for (const c of chauffeursActifs) {
      if (c.pointages.length === 0) {
        await this.prisma.chauffeur.update({
          where: { id: c.id },
          data: { statut: 'HORS_SERVICE' },
        });
      }
    }
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

    // Vérifier si le chauffeur a pointé aujourd'hui
    const pointageAujourdhui = await this.prisma.pointage.findFirst({
      where: { 
        chauffeurId, 
        datePointage: { gte: todayStart },
        type: 'ARRIVEE',
      },
    });

    // Si pas de pointage aujourd'hui et statut != HORS_SERVICE, réinitialiser
    if (!pointageAujourdhui && chauffeur.statut !== 'HORS_SERVICE') {
      await this.prisma.chauffeur.update({
        where: { id: chauffeurId },
        data: { statut: 'HORS_SERVICE' },
      });
      chauffeur.statut = 'HORS_SERVICE';
    }

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

    // Dernier pointage
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
      dernierPointageType: dernierPointage?.type || null,
      aDemarreAujourdhui: !!pointageAujourdhui,
      messageStatus: !pointageAujourdhui 
        ? 'Nouvelle journée ! Cliquez sur Départ pour commencer.' 
        : null,
      aujourdhui: sum(coursesJour),
      semaine: sum(coursesSemaine),
      mois: sum(coursesMois),
    };
  }
}

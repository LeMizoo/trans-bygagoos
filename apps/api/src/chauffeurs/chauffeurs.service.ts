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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [chauffeur, courses, dernierPointage] = await Promise.all([
      this.prisma.chauffeur.findUnique({
        where: { id: chauffeurId },
        include: { moto: true },
      }),
      this.prisma.course.findMany({
        where: { chauffeurId, createdAt: { gte: today } },
      }),
      this.prisma.pointage.findFirst({
        where: { chauffeurId },
        orderBy: { datePointage: 'desc' },
      }),
    ]);

    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');

    return {
      solde: chauffeur.solde,
      coursesJour: courses.length,
      commissionJour: courses.reduce((sum, c) => sum + c.commission, 0),
      gainNetJour: courses.reduce((sum, c) => sum + c.gainNet, 0),
      statut: chauffeur.statut,
      moto: chauffeur.moto,
      dernierPointage: dernierPointage?.datePointage || null,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TARIF_BASE = 2000;
const TARIF_KM = 500;
const COMMISSION_RATE = 0.20;

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany({
      include: { chauffeur: true, moto: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { chauffeurId: string; motoId: string; type: string; distance?: number; prix?: number }) {
    let prix: number;
    let commission: number;

    switch (data.type) {
      case 'NORMALE':
        prix = TARIF_BASE + (data.distance || 0) * TARIF_KM;
        commission = prix * COMMISSION_RATE;
        break;
      case 'ADY_VAROTRA':
        prix = data.prix || 0;
        commission = prix * COMMISSION_RATE;
        break;
      case 'LOCATION_JOURNALIERE':
        prix = data.prix || 0;
        commission = 0;
        break;
      default:
        prix = 0;
        commission = 0;
    }

    const gainNet = prix - commission;

    const course = await this.prisma.course.create({
      data: {
        type: data.type,
        distance: data.distance || 0,
        prix,
        commission,
        gainNet,
        chauffeur: { connect: { id: data.chauffeurId } },
        moto: { connect: { id: data.motoId } },
      },
    });

    await this.prisma.chauffeur.update({
      where: { id: data.chauffeurId },
      data: { solde: { decrement: gainNet } },
    });

    if (data.distance) {
      await this.prisma.moto.update({
        where: { id: data.motoId },
        data: { kmActuel: { increment: data.distance } },
      });
    }

    return course;
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCourses, ca] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { createdAt: { gte: today } } }),
      this.prisma.course.aggregate({
        _sum: { prix: true, commission: true, gainNet: true },
        where: { createdAt: { gte: today } },
      }),
    ]);

    return {
      totalCourses: total,
      coursesAujourdhui: todayCourses,
      caAujourdhui: ca._sum.prix || 0,
      commissionAujourdhui: ca._sum.commission || 0,
      gainNetAujourdhui: ca._sum.gainNet || 0,
    };
  }
}

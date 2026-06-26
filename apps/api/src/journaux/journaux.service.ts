import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JournauxService {
  constructor(private prisma: PrismaService) {}

  async getJournalPointages(date?: string, page = 1, limit = 20) {
    const where: any = {};
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where.datePointage = { gte: d, lt: next };
    }
    const [total, items] = await Promise.all([
      this.prisma.pointage.count({ where }),
      this.prisma.pointage.findMany({
        where,
        include: { chauffeur: { select: { nom: true, codeAcces: true } } },
        orderBy: { datePointage: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getJournalCourses(date?: string, page = 1, limit = 20) {
    const where: any = {};
    if (date) {
      const d = new Date(date); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where.createdAt = { gte: d, lt: next };
    }
    const [total, items] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: { chauffeur: { select: { nom: true } }, moto: { select: { immatriculation: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getJournalVersements(page = 1, limit = 20) {
    const [total, items] = await Promise.all([
      this.prisma.versement.count(),
      this.prisma.versement.findMany({
        include: { chauffeur: { select: { nom: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getJournalAssistance(page = 1, limit = 20) {
    const [total, items] = await Promise.all([
      this.prisma.assistance.count(),
      this.prisma.assistance.findMany({
        include: { chauffeur: { select: { nom: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getStatsGlobales() {
    const [totalCourses, totalChauffeurs, totalMotos, totalVersements, totalAssistance] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.chauffeur.count({ where: { actif: true } }),
      this.prisma.moto.count(),
      this.prisma.versement.count(),
      this.prisma.assistance.count(),
    ]);

    const ca = await this.prisma.course.aggregate({ _sum: { prix: true, commission: true, gainNet: true } });

    return {
      totalCourses, totalChauffeurs, totalMotos, totalVersements, totalAssistance,
      caTotal: ca._sum.prix || 0,
      commissionTotale: ca._sum.commission || 0,
      gainNetTotal: ca._sum.gainNet || 0,
    };
  }
}

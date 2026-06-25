import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, filtre = 'toutes', search = '', type = '') {
    const where: any = {};

    if (filtre === 'non_lues') {
      where.lu = false;
    } else if (filtre === 'lues') {
      where.lu = true;
    }

    if (search) {
      where.OR = [
        { titre: { contains: search } },
        { message: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const [totalAll, nonLues, lues] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { lu: false } }),
      this.prisma.notification.count({ where: { lu: true } }),
    ]);

    return {
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { total: totalAll, non_lues: nonLues, lues, archivees: 0 },
    };
  }

  async create(data: { titre: string; message: string; type: string }) {
    return this.prisma.notification.create({ data });
  }

  async marquerLu(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { lu: true } });
  }

  async countNonLu() {
    return this.prisma.notification.count({ where: { lu: false } });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const [total, items] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async create(data: { titre: string; message: string; type: string }) {
    return this.prisma.notification.create({ data });
  }

  async marquerLu(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { lu: true } });
  }

  async supprimer(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async countNonLu() {
    return this.prisma.notification.count({ where: { lu: false } });
  }
}

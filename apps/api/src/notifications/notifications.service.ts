import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
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

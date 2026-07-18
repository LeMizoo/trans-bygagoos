import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VersementsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.versement.findMany({
      include: { user: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.versement.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.versement.update({ where: { id }, data });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepensesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.depense.findMany({
      include: { user: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.depense.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.depense.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.depense.delete({ where: { id } });
  }
}

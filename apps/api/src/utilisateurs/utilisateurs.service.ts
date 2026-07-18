import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UtilisateursService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        flotte: true,
        cooperative: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRole(role: string) {
    return this.prisma.user.findMany({
      where: { role },
      include: {
        flotte: true,
        cooperative: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}

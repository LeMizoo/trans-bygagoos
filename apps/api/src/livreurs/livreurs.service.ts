import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LivreursService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: 'LIVREUR' },
      include: {
        cooperative: true,
        commandes: true
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        cooperative: true,
        commandes: true
      }
    });
  }

  async create(data: any) {
    return this.prisma.user.create({
      data: { ...data, role: 'LIVREUR' },
      include: {
        cooperative: true
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        cooperative: true
      }
    });
  }

  async findAvailable(cooperativeId: string) {
    return this.prisma.user.findMany({
      where: {
        cooperativeId,
        role: 'LIVREUR',
        statut: 'ACTIF'
      },
      include: {
        cooperative: true
      }
    });
  }
}

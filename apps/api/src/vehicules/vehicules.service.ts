import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiculesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicule.findMany({
      include: {
        cooperative: true,
        commandes: true
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        cooperative: true,
        commandes: true
      }
    });
  }

  async create(data: any) {
    return this.prisma.vehicule.create({
      data,
      include: {
        cooperative: true
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.vehicule.update({
      where: { id },
      data,
      include: {
        cooperative: true
      }
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiculesService {
  constructor(private prisma: PrismaService) {}

  async findAll(coopId: string) {
    return this.prisma.vehicule.findMany({
      where: { coopId },
      include: { livreur: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: { livreur: true, commandes: true },
    });
  }

  async create(data: any) {
    return this.prisma.vehicule.create({ data, include: { livreur: true } });
  }

  async update(id: string, data: any) {
    return this.prisma.vehicule.update({ where: { id }, data, include: { livreur: true } });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LivreursService {
  constructor(private prisma: PrismaService) {}

  async findAll(coopId: string) {
    return this.prisma.user.findMany({
      where: { coopId, role: 'LIVREUR' },
      include: { vehicule: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { vehicule: true, commandes: true },
    });
  }

  async create(data: any) {
    const password = await bcrypt.hash(data.password || 'Livreur123!', 10);
    return this.prisma.user.create({
      data: { ...data, password, role: 'LIVREUR' },
      include: { vehicule: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data, include: { vehicule: true } });
  }

  async getDisponibles(coopId: string) {
    return this.prisma.user.findMany({
      where: { coopId, role: 'LIVREUR', actif: true, vehicule: { statut: 'DISPONIBLE' } },
      include: { vehicule: true },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoopService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coop.findMany({ include: { livreurs: true, vehicules: true } });
  }

  async findOne(id: string) {
    return this.prisma.coop.findUnique({
      where: { id },
      include: { livreurs: true, vehicules: true, commandes: true },
    });
  }

  async findByAdmin(adminId: string) {
    return this.prisma.coop.findFirst({ where: { adminId }, include: { livreurs: true, vehicules: true } });
  }
}

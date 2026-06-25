import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.moto.findMany({
      include: { proprietaire: true, chauffeur: true },
      orderBy: { immatriculation: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.moto.findUnique({
      where: { id },
      include: { proprietaire: true, chauffeur: true, courses: { take: 5, orderBy: { createdAt: 'desc' } } },
    });
  }
}

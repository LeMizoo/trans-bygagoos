import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssistanceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.assistance.findMany({
      include: { chauffeur: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { chauffeurId: string; type: string; urgence: string; description: string }) {
    return this.prisma.assistance.create({
      data: {
        chauffeurId: data.chauffeurId,
        type: data.type,
        urgence: data.urgence,
        description: data.description,
        statut: 'OUVERT',
      },
      include: { chauffeur: true },
    });
  }

  async updateStatut(id: string, statut: string) {
    return this.prisma.assistance.update({
      where: { id },
      data: { statut },
    });
  }
}

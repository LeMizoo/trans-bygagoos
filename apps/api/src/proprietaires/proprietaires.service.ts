import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProprietairesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 15, search = '') {
    const where: any = {};
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { telephone: { contains: search } },
        { cin: { contains: search } },
      ];
    }
    const [total, items] = await Promise.all([
      this.prisma.proprietaire.count({ where }),
      this.prisma.proprietaire.findMany({
        where,
        include: { motos: { select: { id: true, immatriculation: true } } },
        orderBy: { nom: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const p = await this.prisma.proprietaire.findUnique({
      where: { id },
      include: { motos: true },
    });
    if (!p) throw new NotFoundException('Propriétaire non trouvé');
    return p;
  }

  async create(data: any) {
    return this.prisma.proprietaire.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.proprietaire.update({ where: { id }, data });
  }

  async delete(id: string) {
    const motosCount = await this.prisma.moto.count({ where: { proprietaireId: id } });
    if (motosCount > 0) throw new Error(`${motosCount} moto(s) assignée(s). Réassignez-les d'abord.`);
    return this.prisma.proprietaire.delete({ where: { id } });
  }
}

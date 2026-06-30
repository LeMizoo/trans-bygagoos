import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProprietairesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 15, search = '', user?: any) {
    const where: any = {};

    // Si PROPRIETAIRE, ne voir que lui-même
    if (user?.role === 'PROPRIETAIRE') {
      const proprio = await this.prisma.proprietaire.findFirst({ where: { email: user.email } });
      if (proprio) {
        where.id = proprio.id; // Force à ne voir que son propre profil
      } else {
        return { items: [], total: 0, page, pages: 0 };
      }
    }

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
        include: { motos: { select: { id: true, immatriculation: true, statut: true } } },
        orderBy: { nom: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string, user?: any) {
    // Si proprio, ne peut voir que son propre profil
    if (user?.role === 'PROPRIETAIRE') {
      const proprio = await this.prisma.proprietaire.findFirst({ where: { email: user.email } });
      if (!proprio || proprio.id !== id) {
        throw new ForbiddenException('Accès non autorisé');
      }
    }

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

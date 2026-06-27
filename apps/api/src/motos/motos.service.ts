import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.moto.findMany({
      include: { proprietaire: true, chauffeur: { select: { id: true, nom: true } } },
      orderBy: { immatriculation: 'asc' },
    });
  }

  async findOne(id: string) {
    const m = await this.prisma.moto.findUnique({ where: { id }, include: { proprietaire: true, chauffeur: true } });
    if (!m) throw new NotFoundException('Moto non trouvée');
    return m;
  }

  async create(data: any) {
    return this.prisma.moto.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.moto.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.moto.delete({ where: { id } });
  }

  async assignerChauffeur(motoId: string, chauffeurId: string) {
    await this.prisma.moto.update({ where: { id: motoId }, data: { statut: 'utilisee' } });
    await this.prisma.chauffeur.update({ where: { id: chauffeurId }, data: { motoId } });
    return { success: true };
  }

  async desassigner(motoId: string) {
    const moto = await this.prisma.moto.findUnique({ where: { id: motoId }, include: { chauffeur: true } });
    if (moto?.chauffeur) {
      await this.prisma.chauffeur.update({ where: { id: moto.chauffeur.id }, data: { motoId: null } });
    }
    return this.prisma.moto.update({ where: { id: motoId }, data: { statut: 'disponible' } });
  }

  async validerVidange(motoId: string, data: any) {
    return this.prisma.moto.update({
      where: { id: motoId },
      data: {
        kmActuel: data.kmActuel,
        dateDerniereVidange: new Date(data.dateVidange),
        kmProchaineVidange: data.prochaineVidange,
      },
    });
  }
}

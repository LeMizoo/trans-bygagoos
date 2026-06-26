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
    const moto = await this.prisma.moto.findUnique({
      where: { id },
      include: { proprietaire: true, chauffeur: true, courses: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!moto) throw new NotFoundException('Moto non trouvée');
    return moto;
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
    return { success: true, message: 'Moto assignée' };
  }

  async desassigner(motoId: string) {
    const moto = await this.prisma.moto.findUnique({ where: { id: motoId }, include: { chauffeur: true } });
    if (moto?.chauffeur) {
      await this.prisma.chauffeur.update({ where: { id: moto.chauffeur.id }, data: { motoId: null } });
    }
    await this.prisma.moto.update({ where: { id: motoId }, data: { statut: 'disponible' } });
    return { success: true, message: 'Moto désassignée' };
  }

  async validerVidange(motoId: string, data: { kmActuel: number; dateVidange: string; prochaineVidange: number; coutVidange: number; fournisseur: string }) {
    return this.prisma.moto.update({
      where: { id: motoId },
      data: {
        kmActuel: data.kmActuel,
        dateDerniereVidange: new Date(data.dateVidange),
        derniereVidangeKm: data.kmActuel,
        kmProchaineVidange: data.prochaineVidange,
        coutDerniereVidange: data.coutVidange,
        fournisseurVidange: data.fournisseur,
      },
    });
  }
}

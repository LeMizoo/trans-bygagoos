import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.moto.findMany({
      include: { proprietaire: true, chauffeur: true, flotte: true },
      orderBy: { immatriculation: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.moto.findUnique({
      where: { id },
      include: { proprietaire: true, chauffeur: true, depenses: true, courses: true },
    });
  }

  async create(data: any) {
    if (data.dateAchat && typeof data.dateAchat === 'string') data.dateAchat = new Date(data.dateAchat);
    if (data.finAssurance && typeof data.finAssurance === 'string') data.finAssurance = new Date(data.finAssurance);
    if (data.finVignette && typeof data.finVignette === 'string') data.finVignette = new Date(data.finVignette);
    return this.prisma.moto.create({ data });
  }

  async update(id: string, data: any) {
    if (data.dateAchat && typeof data.dateAchat === 'string') data.dateAchat = new Date(data.dateAchat);
    return this.prisma.moto.update({ where: { id }, data });
  }

  async delete(id: string) { return this.prisma.moto.delete({ where: { id } }); }
  
  async assignerChauffeur(id: string, chauffeurId: string) {
    // Désassigner l'ancien chauffeur de cette moto si existe
    const moto = await this.prisma.moto.findUnique({ where: { id }, include: { chauffeur: true } });
    if (moto?.chauffeur) {
      await this.prisma.chauffeur.update({ where: { id: moto.chauffeur.id }, data: { motoId: null } });
    }
    // Assigner le nouveau
    return this.prisma.moto.update({ where: { id }, data: { chauffeurId } });
  }

  async desassigner(id: string) {
    const moto = await this.prisma.moto.findUnique({ where: { id }, include: { chauffeur: true } });
    if (moto?.chauffeur) {
      await this.prisma.chauffeur.update({ where: { id: moto.chauffeur.id }, data: { motoId: null } });
    }
    return this.prisma.moto.update({ where: { id }, data: { chauffeurId: null } });
  }

  async validerVidange(id: string, data: any) {
    return this.prisma.moto.update({ where: { id }, data: { derniereVidangeKm: data.km, dateDerniereVidange: new Date(), kmProchaineVidange: data.km + 3000 } });
  }
}

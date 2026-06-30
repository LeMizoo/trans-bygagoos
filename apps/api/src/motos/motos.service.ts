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

  async findByProprietaire(proprietaireId: string) {
    return this.prisma.moto.findMany({
      where: { proprietaireId },
      include: { proprietaire: true, chauffeur: true },
      orderBy: { immatriculation: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.moto.findUnique({
      where: { id },
      include: { proprietaire: true, chauffeur: true, depenses: { orderBy: { date: 'desc' } }, courses: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
  }

  async getStatsMoto(id: string) {
    const moto = await this.prisma.moto.findUnique({
      where: { id },
      include: { proprietaire: true, chauffeur: true, depenses: { orderBy: { date: 'desc' } }, courses: { orderBy: { createdAt: 'desc' }, take: 100 } },
    });
    if (!moto) return null;
    const courses = moto.courses || [];
    const depenses = moto.depenses || [];
    const totalCA = courses.reduce((s: number, c: any) => s + (c.prix || 0), 0);
    const totalCommission = courses.reduce((s: number, c: any) => s + (c.commission || 0), 0);
    const totalDepenses = depenses.reduce((s: number, d: any) => s + (d.montant || 0), 0);
    return {
      moto: { id: moto.id, immatriculation: moto.immatriculation, marque: moto.marque, modele: moto.modele, kmActuel: moto.kmActuel, statut: moto.statut, finAssurance: moto.finAssurance, finVignette: moto.finVignette, kmProchaineVidange: moto.kmProchaineVidange },
      proprietaire: moto.proprietaire,
      chauffeur: moto.chauffeur,
      stats: { totalCourses: courses.length, totalCA, totalCommission, totalDepenses, gainNet: totalCA - totalCommission - totalDepenses },
      depenses: depenses.slice(0, 20),
      courses: courses.slice(0, 20),
    };
  }

  async create(data: any) { return this.prisma.moto.create({ data }); }
  async update(id: string, data: any) { return this.prisma.moto.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.moto.delete({ where: { id } }); }
  async assignerChauffeur(id: string, chauffeurId: string) { return this.prisma.moto.update({ where: { id }, data: { chauffeurId, statut: 'en_service' } }); }
  async desassigner(id: string) { return this.prisma.moto.update({ where: { id }, data: { chauffeurId: null, statut: 'disponible' } }); }
  async validerVidange(id: string, data: { km: number; cout: number; fournisseur: string }) {
    return this.prisma.moto.update({ where: { id }, data: { derniereVidangeKm: data.km, coutDerniereVidange: data.cout, fournisseurVidange: data.fournisseur, dateDerniereVidange: new Date(), kmProchaineVidange: data.km + 3000 } });
  }
}

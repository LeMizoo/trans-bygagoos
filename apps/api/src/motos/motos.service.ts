import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotosService {
  constructor(private prisma: PrismaService) {}

  async findAll(user?: any) {
    const where: any = {};
    // Si proprio, filtrer par ses motos
    if (user?.role === 'PROPRIETAIRE') {
      const proprio = await this.prisma.proprietaire.findFirst({ where: { email: user.email } });
      if (proprio) where.proprietaireId = proprio.id;
    }
    return this.prisma.moto.findMany({
      where,
      include: { proprietaire: true, chauffeur: true },
      orderBy: { immatriculation: 'asc' },
    });
  }

  async findOne(id: string, user?: any) {
    const moto = await this.prisma.moto.findUnique({ where: { id }, include: { proprietaire: true } });
    // Vérifier que le proprio a le droit
    if (user?.role === 'PROPRIETAIRE' && moto) {
      const proprio = await this.prisma.proprietaire.findFirst({ where: { email: user.email } });
      if (!proprio || moto.proprietaireId !== proprio.id) return null;
    }
    return this.prisma.moto.findUnique({
      where: { id },
      include: {
        proprietaire: true, chauffeur: true,
        depenses: { orderBy: { date: 'desc' } },
        courses: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
  }

  async getStatsMoto(id: string, user?: any) {
    const moto = await this.prisma.moto.findUnique({
      where: { id },
      include: {
        proprietaire: true, chauffeur: true,
        depenses: { orderBy: { date: 'desc' } },
        courses: { orderBy: { createdAt: 'desc' }, take: 100 },
      },
    });
    if (!moto) return null;
    if (user?.role === 'PROPRIETAIRE') {
      const proprio = await this.prisma.proprietaire.findFirst({ where: { email: user.email } });
      if (!proprio || moto.proprietaireId !== proprio.id) return null;
    }

    const courses = moto.courses || [];
    const depenses = moto.depenses || [];
    const totalCA = courses.reduce((sum: number, c: any) => sum + (c.prix || 0), 0);
    const totalCommission = courses.reduce((sum: number, c: any) => sum + (c.commission || 0), 0);
    const totalDepenses = depenses.reduce((sum: number, d: any) => sum + (d.montant || 0), 0);

    const depensesByCategorie: Record<string, number> = {};
    depenses.forEach((d: any) => { depensesByCategorie[d.categorie] = (depensesByCategorie[d.categorie] || 0) + d.montant; });

    const coursesByType: Record<string, { count: number; total: number }> = {};
    courses.forEach((c: any) => {
      if (!coursesByType[c.type]) coursesByType[c.type] = { count: 0, total: 0 };
      coursesByType[c.type].count++;
      coursesByType[c.type].total += c.prix || 0;
    });

    return {
      moto: { id: moto.id, immatriculation: moto.immatriculation, marque: moto.marque, modele: moto.modele, kmActuel: moto.kmActuel, statut: moto.statut, finAssurance: moto.finAssurance, finVignette: moto.finVignette },
      proprietaire: moto.proprietaire,
      chauffeur: moto.chauffeur,
      stats: { totalCourses: courses.length, totalCA, totalCommission, totalDepenses, gainNet: totalCA - totalCommission - totalDepenses },
      depensesByCategorie, coursesByType,
      depenses: depenses.slice(0, 20),
      courses: courses.slice(0, 20),
    };
  }

  async create(data: any) { return this.prisma.moto.create({ data }); }
  async update(id: string, data: any) { return this.prisma.moto.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.moto.delete({ where: { id } }); }

  async assignerChauffeur(id: string, chauffeurId: string) {
    return this.prisma.moto.update({ where: { id }, data: { chauffeurId, statut: 'en_service' } });
  }
  async desassigner(id: string) {
    return this.prisma.moto.update({ where: { id }, data: { chauffeurId: null, statut: 'disponible' } });
  }
  async validerVidange(id: string, data: { km: number; cout: number; fournisseur: string }) {
    return this.prisma.moto.update({
      where: { id },
      data: { derniereVidangeKm: data.km, coutDerniereVidange: data.cout, fournisseurVidange: data.fournisseur, dateDerniereVidange: new Date(), kmProchaineVidange: data.km + 3000 },
    });
  }
}

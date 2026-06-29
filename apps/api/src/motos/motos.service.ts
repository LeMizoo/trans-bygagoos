import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.moto.findMany({
      include: {
        proprietaire: true,
        chauffeur: true,
        depenses: true,
        courses: true,
      },
      orderBy: { immatriculation: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.moto.findUnique({
      where: { id },
      include: {
        proprietaire: true,
        chauffeur: true,
        depenses: { orderBy: { date: 'desc' } },
        courses: { orderBy: { date: 'desc' }, take: 50 },
      },
    });
  }

  // Nouveau : stats complètes d'une moto
  async getStatsMoto(id: string) {
    const moto = await this.prisma.moto.findUnique({
      where: { id },
      include: {
        proprietaire: true,
        chauffeur: true,
        depenses: { orderBy: { date: 'desc' } },
        courses: { orderBy: { date: 'desc' }, take: 100 },
      },
    });

    if (!moto) return null;

    // Calculer les totaux
    const totalCourses = moto.courses.length;
    const totalCA = moto.courses.reduce((sum, c) => sum + c.prix, 0);
    const totalCommission = moto.courses.reduce((sum, c) => sum + c.commission, 0);
    const totalDepenses = moto.depenses.reduce((sum, d) => sum + d.montant, 0);

    // Dépenses par catégorie
    const depensesByCategorie: Record<string, number> = {};
    moto.depenses.forEach(d => {
      depensesByCategorie[d.categorie] = (depensesByCategorie[d.categorie] || 0) + d.montant;
    });

    // Courses par type
    const coursesByType: Record<string, { count: number; total: number }> = {};
    moto.courses.forEach(c => {
      if (!coursesByType[c.type]) coursesByType[c.type] = { count: 0, total: 0 };
      coursesByType[c.type].count++;
      coursesByType[c.type].total += c.prix;
    });

    return {
      moto: {
        id: moto.id,
        immatriculation: moto.immatriculation,
        marque: moto.marque,
        modele: moto.modele,
        cylindree: moto.cylindree,
        couleur: moto.couleur,
        kmActuel: moto.kmActuel,
        prixAchat: moto.prixAchat,
        dateAchat: moto.dateAchat,
        statut: moto.statut,
        numMoteur: moto.numMoteur,
        numChassis: moto.numChassis,
        kmProchaineVidange: moto.kmProchaineVidange,
        dateDerniereVidange: moto.dateDerniereVidange,
        finAssurance: moto.finAssurance,
        finVignette: moto.finVignette,
      },
      proprietaire: moto.proprietaire,
      chauffeur: moto.chauffeur,
      stats: {
        totalCourses,
        totalCA,
        totalCommission,
        totalDepenses,
        gainNet: totalCA - totalCommission - totalDepenses,
      },
      depensesByCategorie,
      coursesByType,
      depenses: moto.depenses.slice(0, 20),
      courses: moto.courses.slice(0, 20),
    };
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

  async assignerChauffeur(id: string, chauffeurId: string) {
    return this.prisma.moto.update({
      where: { id },
      data: { chauffeurId, statut: 'en_service' },
    });
  }

  async desassigner(id: string) {
    return this.prisma.moto.update({
      where: { id },
      data: { chauffeurId: null, statut: 'disponible' },
    });
  }

  async validerVidange(id: string, data: { km: number; cout: number; fournisseur: string }) {
    return this.prisma.moto.update({
      where: { id },
      data: {
        derniereVidangeKm: data.km,
        coutDerniereVidange: data.cout,
        fournisseurVidange: data.fournisseur,
        dateDerniereVidange: new Date(),
        kmProchaineVidange: data.km + 3000,
      },
    });
  }
}

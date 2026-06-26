import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VersementsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.versement.findMany({
      include: { chauffeur: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByChauffeur(chauffeurId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // CA net du jour (commission totale du jour)
    const caNetJour = await this.prisma.course.aggregate({
      _sum: { gainNet: true, commission: true, prix: true },
      where: { chauffeurId, createdAt: { gte: today } },
    });

    // Tous les versements
    const versements = await this.prisma.versement.findMany({
      where: { chauffeurId },
      orderBy: { createdAt: 'desc' },
    });

    // Total dû et versé
    const totalDu = versements.reduce((s, v) => s + v.montantDu, 0);
    const totalVerse = versements.reduce((s, v) => s + v.montantVerse, 0);
    const resteAPayer = totalDu - totalVerse;

    // Impayés détaillés avec date des courses
    const impayes = versements
      .filter(v => v.montantDu > v.montantVerse)
      .map(v => ({
        id: v.id,
        date: v.createdAt,
        montantDu: v.montantDu,
        montantVerse: v.montantVerse,
        reste: v.montantDu - v.montantVerse,
        statut: v.statut,
      }));

    // Gain net disponible (CA net jour - reste à payer)
    const gainNetJour = caNetJour._sum.gainNet || 0;
    const disponible = gainNetJour - resteAPayer;

    return {
      versements,
      resume: {
        caNetJour: gainNetJour,
        commissionJour: caNetJour._sum.commission || 0,
        caBrutJour: caNetJour._sum.prix || 0,
        totalDu,
        totalVerse,
        resteAPayer,
        disponible,
        montantSuggere: Math.max(0, disponible),
      },
      impayes,
      nbImpayes: impayes.length,
    };
  }

  async create(data: { chauffeurId: string; montantVerse: number }) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: data.chauffeurId },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculer le CA net du jour comme montant dû
    const caNet = await this.prisma.course.aggregate({
      _sum: { gainNet: true },
      where: { chauffeurId: data.chauffeurId, createdAt: { gte: today } },
    });

    return this.prisma.versement.create({
      data: {
        chauffeurId: data.chauffeurId,
        montantDu: caNet._sum.gainNet || chauffeur.solde,
        montantVerse: data.montantVerse,
        statut: 'EN_ATTENTE',
      },
    });
  }

  async valider(id: string) {
    const v = await this.prisma.versement.update({
      where: { id },
      data: { statut: 'VALIDE' },
    });
    await this.prisma.chauffeur.update({
      where: { id: v.chauffeurId },
      data: { solde: { decrement: v.montantVerse } },
    });
    return v;
  }

  async refuser(id: string) {
    return this.prisma.versement.update({
      where: { id },
      data: { statut: 'REFUSE' },
    });
  }
}

  async findOne(id: string) {
    const v = await this.prisma.versement.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Versement non trouvé');
    return v;
  }

  async validerPartiel(id: string, montant: number) {
    const v = await this.prisma.versement.findUnique({ where: { id } });
    const nouveauVerse = (v.montantVerse || 0) + montant;
    const statut = nouveauVerse >= v.montantDu ? 'VALIDE' : 'EN_ATTENTE';
    return this.prisma.versement.update({
      where: { id },
      data: { montantVerse: nouveauVerse, statut },
    });
  }

  async countImpayes(chauffeurId: string) {
    const impayes = await this.prisma.versement.findMany({
      where: { chauffeurId, montantDu: { gt: 0 } },
    });
    const impayesParJour = new Map<string, number>();
    for (const v of impayes) {
      const dateKey = v.createdAt.toISOString().split('T')[0];
      const reste = v.montantDu - v.montantVerse;
      if (reste > 0) impayesParJour.set(dateKey, reste);
    }
    return impayesParJour.size;
  }

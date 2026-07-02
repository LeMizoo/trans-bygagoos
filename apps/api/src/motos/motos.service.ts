import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotosService {
  constructor(private prisma: PrismaService) {}

  async findAll(flotteId?: string) {
    const where: any = {};
    if (flotteId) where.flotteId = flotteId;
    return this.prisma.moto.findMany({
      where,
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
    // Vérifier la limite de motos selon le plan
    if (data.flotteId) {
      const flotte = await this.prisma.flotte.findUnique({ where: { id: data.flotteId } });
      if (flotte) {
        const motosCount = await this.prisma.moto.count({ where: { flotteId: data.flotteId } });
        const limite = this.getLimiteMotos(flotte.abonnement || 'GRATUIT');
        if (motosCount >= limite) {
          throw new ForbiddenException(
            `Limite de ${limite} moto(s) atteinte pour le plan ${flotte.abonnement || 'GRATUIT'}. Passez au plan supérieur.`
          );
        }
      }
    }
    if (data.dateAchat && typeof data.dateAchat === 'string') data.dateAchat = new Date(data.dateAchat);
    return this.prisma.moto.create({ data });
  }

  async update(id: string, data: any) { return this.prisma.moto.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.moto.delete({ where: { id } }); }
  
  async assignerChauffeur(motoId: string, chauffeurId: string) {
    const moto = await this.prisma.moto.findUnique({ where: { id: motoId }, include: { chauffeur: true } });
    if (moto?.chauffeur) {
      await this.prisma.chauffeur.update({ where: { id: moto.chauffeur.id }, data: { motoId: null } });
    }
    return this.prisma.moto.update({ where: { id: motoId }, data: { chauffeur: { connect: { id: chauffeurId } } } });
  }

  async desassigner(motoId: string) {
    const moto = await this.prisma.moto.findUnique({ where: { id: motoId }, include: { chauffeur: true } });
    if (moto?.chauffeur) {
      await this.prisma.chauffeur.update({ where: { id: moto.chauffeur.id }, data: { motoId: null } });
    }
    return this.prisma.moto.update({ where: { id: motoId }, data: { chauffeur: { disconnect: true } } });
  }

  async validerVidange(id: string, data: any) {
    return this.prisma.moto.update({
      where: { id },
      data: { dateDerniereVidange: new Date(), kmProchaineVidange: data.km + 3000 },
    });
  }

  private getLimiteMotos(abonnement: string): number {
    switch (abonnement) {
      case 'GRATUIT': return 1;
      case '2_5': return 5;
      case '6_10': return 10;
      case '11_PLUS': return Number.MAX_SAFE_INTEGER;
      default: return 1;
    }
  }
}

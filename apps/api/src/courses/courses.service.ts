import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TARIF_BASE = 2000;
const TARIF_KM = 500;
const COMMISSION_RATE = 0.20;

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page?: number, limit?: number) {
    const p = page || 1;
    const l = limit || 50;
    const [total, items] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.findMany({
        include: { chauffeur: true, moto: true },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return { items, total, page: p, pages: Math.ceil(total / l) };
  }

  async findByMotosIds(motosIds: string[], page?: number, limit?: number) {
    if (!motosIds || motosIds.length === 0) return { items: [], total: 0, page: 1, pages: 0 };
    const p = page || 1;
    const l = limit || 50;
    const where = { motoId: { in: motosIds } };
    const [total, items] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: { chauffeur: true, moto: true },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);
    return { items, total, page: p, pages: Math.ceil(total / l) };
  }

  async create(data: { chauffeurId: string; motoId: string; type: string; distance?: number; prix?: number }) {
    const chauffeur = await this.prisma.chauffeur.findUnique({ where: { id: data.chauffeurId } });
    if (!chauffeur) throw new BadRequestException('Chauffeur non trouvé');
    if (!chauffeur.actif) throw new ForbiddenException('Compte désactivé');
    if (chauffeur.statut !== 'EN_SERVICE') throw new ForbiddenException('Vous devez être EN SERVICE');

    const typesConfig = await this.prisma.parametre.findFirst({ where: { nom: 'types_courses_autorises' } });
    if (typesConfig?.valeur) {
      const typesAutorises = JSON.parse(typesConfig.valeur);
      if (!typesAutorises.includes(data.type)) throw new ForbiddenException(`Type "${data.type}" non autorisé`);
    }
    if (!data.motoId) throw new BadRequestException('Aucune moto assignée');

    let prix: number; let commission: number;
    switch (data.type) {
      case 'NORMALE': prix = TARIF_BASE + (data.distance || 0) * TARIF_KM; commission = prix * COMMISSION_RATE; break;
      case 'ADY_VAROTRA': prix = data.prix || 0; commission = prix * COMMISSION_RATE; break;
      case 'LOCATION_JOURNALIERE': prix = data.prix || 0; commission = 0; break;
      default: prix = 0; commission = 0;
    }
    if (prix <= 0) throw new BadRequestException('Montant invalide');
    const gainNet = prix - commission;

    const course = await this.prisma.course.create({
      data: { type: data.type, distance: data.distance || 0, prix, commission, gainNet, chauffeur: { connect: { id: data.chauffeurId } }, moto: { connect: { id: data.motoId } } },
    });
    await this.prisma.chauffeur.update({ where: { id: data.chauffeurId }, data: { solde: { decrement: gainNet } } });
    if (data.distance && data.distance > 0) {
      await this.prisma.moto.update({ where: { id: data.motoId }, data: { kmActuel: { increment: data.distance } } });
    }
    return { success: true, message: 'Course enregistrée', course_id: course.id, prix, commission, gain_net: gainNet };
  }

  async syncOffline(data: { chauffeurId: string; courses: any[] }) {
    const results = [];
    for (const c of data.courses) {
      try {
        const course = await this.create({ chauffeurId: data.chauffeurId, motoId: c.motoId, type: c.type, distance: c.distance, prix: c.prix });
        results.push({ success: true, id: course.course_id });
      } catch (e: any) { results.push({ success: false, error: e?.message }); }
    }
    return { synced: results.filter((r: any) => r.success).length, results };
  }

  async getStats(user?: any) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, todayCourses, ca] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { createdAt: { gte: today } } }),
      this.prisma.course.aggregate({ _sum: { prix: true, commission: true, gainNet: true }, where: { createdAt: { gte: today } } }),
    ]);
    return { totalCourses: total, coursesAujourdhui: todayCourses, caAujourdhui: ca._sum.prix || 0, commissionAujourdhui: ca._sum.commission || 0, gainNetAujourdhui: ca._sum.gainNet || 0 };
  }
}

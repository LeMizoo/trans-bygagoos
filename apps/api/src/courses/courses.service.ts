import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TARIF_BASE = 2000;
const TARIF_KM = 500;
const COMMISSION_RATE = 0.20;

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany({
      include: { chauffeur: true, moto: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { chauffeurId: string; motoId: string; type: string; distance?: number; prix?: number }) {
    const chauffeur = await this.prisma.chauffeur.findUnique({ where: { id: data.chauffeurId } });
    if (!chauffeur) throw new BadRequestException('Chauffeur non trouvé');
    if (!chauffeur.actif) throw new ForbiddenException('Compte désactivé');
    if (chauffeur.statut !== 'EN_SERVICE') throw new ForbiddenException('Vous devez être EN SERVICE. Cliquez sur DÉPART.');

    const modeTypeNotif = await this.prisma.notification.findFirst({ where: { type: 'MODE_TYPE' }, orderBy: { createdAt: 'desc' } });
    const typeImposeNotif = await this.prisma.notification.findFirst({ where: { type: 'TYPE_IMPOSE' }, orderBy: { createdAt: 'desc' } });
    const modeType = modeTypeNotif?.message || 'libre';
    const typeImpose = typeImposeNotif?.message || 'NORMALE';
    if (modeType === 'impose' && data.type !== typeImpose) throw new ForbiddenException(`Mode imposé : seul "${typeImpose}" est autorisé.`);
    if (!data.motoId) throw new BadRequestException('Aucune moto assignée');

    let prix: number;
    let commission: number;
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
      } catch (e: any) { results.push({ success: false, error: e?.message || 'Erreur' }); }
    }
    return { synced: results.filter((r: any) => r.success).length, results };
  }

  async getStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, todayCourses, ca] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { createdAt: { gte: today } } }),
      this.prisma.course.aggregate({ _sum: { prix: true, commission: true, gainNet: true }, where: { createdAt: { gte: today } } }),
    ]);
    return { totalCourses: total, coursesAujourdhui: todayCourses, caAujourdhui: ca._sum.prix || 0, commissionAujourdhui: ca._sum.commission || 0, gainNetAujourdhui: ca._sum.gainNet || 0 };
  }
}

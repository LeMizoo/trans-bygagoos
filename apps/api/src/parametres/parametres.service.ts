import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParametresService {
  constructor(private prisma: PrismaService) {}

  // Coup d'envoi
  async getCoupEnvoi() {
    const actif = await this.prisma.notification.findFirst({
      where: { type: 'COUP_ENVOI_ACTIF' },
      orderBy: { createdAt: 'desc' },
    });
    const heure = await this.prisma.notification.findFirst({
      where: { type: 'COUP_ENVOI_HEURE' },
      orderBy: { createdAt: 'desc' },
    });
    return {
      actif: actif?.message === '1',
      heure: heure?.message || '07:00',
    };
  }

  async setCoupEnvoi(actif: boolean, heure: string) {
    // Stocker dans la table notifications (faute de table parametres)
    await this.prisma.notification.create({
      data: { type: 'COUP_ENVOI_ACTIF', titre: 'Coup envoi', message: actif ? '1' : '0' },
    });
    await this.prisma.notification.create({
      data: { type: 'COUP_ENVOI_HEURE', titre: 'Heure coup envoi', message: heure },
    });

    if (actif) {
      // Réinitialiser les pointages du jour
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await this.prisma.pointage.deleteMany({
        where: { datePointage: { gte: today } },
      });
      await this.prisma.chauffeur.updateMany({
        data: { statut: 'HORS_SERVICE' },
      });
    }
    return { success: true, message: actif ? `Coup d'envoi programmé à ${heure}` : 'Coup d\'envoi désactivé' };
  }

  async lancerCoupEnvoi() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.prisma.pointage.deleteMany({ where: { datePointage: { gte: today } } });
    await this.prisma.chauffeur.updateMany({ data: { statut: 'HORS_SERVICE' } });
    const now = new Date();
    const heure = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await this.prisma.notification.create({
      data: { type: 'COUP_ENVOI_HEURE', titre: 'Heure coup envoi', message: heure },
    });
    return { success: true, message: `Coup d'envoi lancé à ${heure}` };
  }

  // Mode type de course
  async getModeType() {
    const mode = await this.prisma.notification.findFirst({
      where: { type: 'MODE_TYPE' },
      orderBy: { createdAt: 'desc' },
    });
    const typeImpose = await this.prisma.notification.findFirst({
      where: { type: 'TYPE_IMPOSE' },
      orderBy: { createdAt: 'desc' },
    });
    return {
      mode: mode?.message || 'libre',
      typeImpose: typeImpose?.message || 'NORMALE',
    };
  }

  async setModeType(mode: string, typeImpose: string) {
    await this.prisma.notification.create({
      data: { type: 'MODE_TYPE', titre: 'Mode type', message: mode },
    });
    await this.prisma.notification.create({
      data: { type: 'TYPE_IMPOSE', titre: 'Type imposé', message: typeImpose },
    });
    if (mode === 'impose') {
      // Mettre à jour tous les chauffeurs (via le champ statut pour l'instant)
      // Plus tard : ajouter un champ typeCourseActif dans Chauffeur
    }
    return { success: true, message: mode === 'impose' ? `Mode imposé : ${typeImpose}` : 'Mode libre activé' };
  }

  // Stats pointages
  async getStats(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const [arrivees, departs, totalChauffeurs] = await Promise.all([
      this.prisma.pointage.count({ where: { type: 'ARRIVEE', datePointage: { gte: targetDate, lt: nextDate } } }),
      this.prisma.pointage.count({ where: { type: 'FIN_SERVICE', datePointage: { gte: targetDate, lt: nextDate } } }),
      this.prisma.chauffeur.count(),
    ]);

    return { arrivees, departs, totalChauffeurs, presents: arrivees };
  }
}

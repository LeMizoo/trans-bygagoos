import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PointagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (startDate && endDate) where.date = { gte: startDate, lte: endDate };

    return this.prisma.pointage.findMany({
      where,
      include: {
        user: { select: { id: true, nom: true, prenom: true, codeAcces: true, role: true } }
      },
      orderBy: { date: 'desc' },
    });
  }

  async findToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.pointage.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      orderBy: { date: 'desc' },
    });
  }

  async pointer(userId: string, type: 'ENTREE' | 'SORTIE', localisation?: string) {
    const dernierPointage = await this.prisma.pointage.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (dernierPointage && dernierPointage.type === type) {
      throw new BadRequestException(
        `Vous avez déjà pointé une ${type.toLowerCase()} aujourd'hui. ` +
        `Dernier pointage : ${dernierPointage.date.toLocaleString('fr-FR')}`
      );
    }

    if (type === 'SORTIE' && (!dernierPointage || dernierPointage.type !== 'ENTREE')) {
      throw new BadRequestException('Vous devez d\'abord pointer votre entrée avant de pointer votre sortie');
    }

    const pointage = await this.prisma.pointage.create({
      data: {
        type,
        date: new Date(),
        localisation: localisation || null,
        userId,
      },
      include: {
        user: { select: { id: true, nom: true, prenom: true, codeAcces: true } }
      }
    });

    // 🆕 Logger l'action
    await this.prisma.log.create({
      data: {
        action: `POINTAGE_${type}`,
        details: `${type} - ${pointage.user.nom} ${pointage.user.prenom}${localisation ? ` (${localisation})` : ''}`,
        userId,
      }
    });

    console.log(`✅ Pointage ${type} enregistré pour ${pointage.user.nom} ${pointage.user.prenom}`);
    return pointage;
  }

  async getStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate && endDate) where.date = { gte: startDate, lte: endDate };

    const pointages = await this.prisma.pointage.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    let totalMinutes = 0;
    let entree: Date | null = null;

    for (const pointage of pointages) {
      if (pointage.type === 'ENTREE') {
        entree = pointage.date;
      } else if (pointage.type === 'SORTIE' && entree) {
        totalMinutes += (pointage.date.getTime() - entree.getTime()) / 60000;
        entree = null;
      }
    }

    if (entree) {
      totalMinutes += (new Date().getTime() - entree.getTime()) / 60000;
    }

    const heures = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return {
      totalPointages: pointages.length,
      entrees: pointages.filter(p => p.type === 'ENTREE').length,
      sorties: pointages.filter(p => p.type === 'SORTIE').length,
      heuresTravaillees: `${heures}h${minutes}min`,
      estPresent: pointages.length > 0 && pointages[pointages.length - 1]?.type === 'ENTREE',
      dernierPointage: pointages.length > 0 ? pointages[pointages.length - 1] : null,
    };
  }

  async getPresenceToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pointages = await this.prisma.pointage.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      include: {
        user: {
          select: {
            id: true, nom: true, prenom: true, codeAcces: true, role: true,
            flotte: { select: { nom: true } },
            cooperative: { select: { nom: true } },
          }
        }
      },
      orderBy: { date: 'desc' },
    });

    const presenceByUser = new Map();
    for (const p of pointages) {
      if (!presenceByUser.has(p.userId)) {
        presenceByUser.set(p.userId, {
          user: p.user,
          dernierType: p.type,
          derniereDate: p.date,
          pointages: [],
        });
      }
      presenceByUser.get(p.userId).pointages.push(p);
    }

    return {
      date: today.toISOString().split('T')[0],
      presents: Array.from(presenceByUser.values()).filter((p: any) => p.dernierType === 'ENTREE').length,
      absents: 0,
      details: Array.from(presenceByUser.values()),
    };
  }
}

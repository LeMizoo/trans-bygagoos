import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};
    
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = { contains: params.action };
    if (params.startDate && params.endDate) {
      where.createdAt = {
        gte: params.startDate,
        lte: params.endDate,
      };
    }

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              role: true,
              codeAcces: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: params.skip || 0,
        take: params.take || 50,
      }),
      this.prisma.log.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page: Math.floor((params.skip || 0) / (params.take || 50)) + 1,
      pageSize: params.take || 50,
    };
  }

  async findByUser(userId: string, limit = 20) {
    return this.prisma.log.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStats(action?: string) {
    const where: any = {};
    if (action) where.action = action;

    // Logs par jour (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await this.prisma.log.findMany({
      where: {
        ...where,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { action: true, createdAt: true },
    });

    // Grouper par jour
    const logsByDay = {};
    const actionsCount = {};

    logs.forEach(log => {
      const day = log.createdAt.toISOString().split('T')[0];
      if (!logsByDay[day]) logsByDay[day] = 0;
      logsByDay[day]++;

      if (!actionsCount[log.action]) actionsCount[log.action] = 0;
      actionsCount[log.action]++;
    });

    return {
      totalLogs: logs.length,
      logsByDay,
      actionsCount,
      period: {
        start: sevenDaysAgo.toISOString(),
        end: new Date().toISOString(),
      }
    };
  }

  async getRecentActivities(limit = 10) {
    return this.prisma.log.findMany({
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getLoginsByDay(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logs = await this.prisma.log.findMany({
      where: {
        action: { contains: 'LOGIN' },
        createdAt: { gte: startDate },
      },
      select: { createdAt: true, action: true },
      orderBy: { createdAt: 'asc' },
    });

    const loginsByDay = {};
    logs.forEach(log => {
      const day = log.createdAt.toISOString().split('T')[0];
      if (!loginsByDay[day]) loginsByDay[day] = { total: 0, mobile: 0, web: 0 };
      loginsByDay[day].total++;
      if (log.action === 'LOGIN_MOBILE') loginsByDay[day].mobile++;
      else loginsByDay[day].web++;
    });

    return {
      period: `${days} jours`,
      loginsByDay,
      totalLogins: logs.length,
    };
  }

  async logAction(userId: string, action: string, details?: string) {
    return this.prisma.log.create({
      data: {
        action,
        details: details || null,
        userId,
      },
    });
  }

  // Méthode utilitaire pour logger depuis d'autres services
  static async log(
    prisma: PrismaService,
    userId: string,
    action: string,
    details?: string,
  ) {
    return prisma.log.create({
      data: { action, details, userId },
    });
  }

  async deleteOldLogs(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.log.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return {
      message: `${result.count} logs supprimés (plus de ${daysOld} jours)`,
      deletedCount: result.count,
      cutoffDate: cutoffDate.toISOString(),
    };
  }
}

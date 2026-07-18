import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string, onlyUnread = false) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (onlyUnread) where.lu = false;

    return this.prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            codeAcces: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          }
        }
      }
    });
    if (!notification) throw new NotFoundException('Notification non trouvée');
    return notification;
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, lu: false },
    });
  }

  async create(data: {
    titre: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
    userId: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        titre: data.titre,
        message: data.message,
        type: data.type,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          }
        }
      }
    });

    console.log(`🔔 Notification envoyée à ${notification.user.nom} ${notification.user.prenom}: ${data.titre}`);
    return notification;
  }

  async sendToMultipleUsers(data: {
    titre: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
    userIds: string[];
  }) {
    const notifications = [];

    for (const userId of data.userIds) {
      const notification = await this.prisma.notification.create({
        data: {
          titre: data.titre,
          message: data.message,
          type: data.type,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
            }
          }
        }
      });
      notifications.push(notification);
    }

    console.log(`🔔 Notification envoyée à ${data.userIds.length} utilisateurs: ${data.titre}`);
    return {
      message: `Notification envoyée à ${data.userIds.length} utilisateurs`,
      count: data.userIds.length,
      notifications,
    };
  }

  async sendToAllByRole(data: {
    titre: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
    role: string;
  }) {
    const users = await this.prisma.user.findMany({
      where: { role: data.role, statut: 'ACTIF' },
      select: { id: true },
    });

    const userIds = users.map(u => u.id);

    return this.sendToMultipleUsers({
      titre: data.titre,
      message: data.message,
      type: data.type,
      userIds,
    });
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: { lu: true },
    });

    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, lu: false },
      data: { lu: true },
    });

    return {
      message: `${result.count} notifications marquées comme lues`,
      count: result.count,
    };
  }

  async deleteOld(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        lu: true, // Ne supprimer que les notifications lues
      },
    });

    return {
      message: `${result.count} notifications supprimées (plus de ${daysOld} jours)`,
      deletedCount: result.count,
    };
  }
}

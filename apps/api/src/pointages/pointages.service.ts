import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PointagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pointage.findMany({
      include: { chauffeur: true },
      orderBy: { datePointage: 'desc' },
    });
  }

  async findByChauffeur(chauffeurId: string) {
    return this.prisma.pointage.findMany({
      where: { chauffeurId },
      orderBy: { datePointage: 'desc' },
      take: 20,
    });
  }

  async pointer(chauffeurId: string, type: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
    });
    if (!chauffeur) throw new NotFoundException('Chauffeur non trouvé');
    if (!chauffeur.actif) throw new ForbiddenException('Compte désactivé');

    // Si FIN_SERVICE, vérifier les versements impayés
    if (type === 'FIN_SERVICE') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculer le CA net du jour
      const caNetJour = await this.prisma.course.aggregate({
        _sum: { gainNet: true },
        where: { chauffeurId, createdAt: { gte: today } },
      });

      const gainNetJour = caNetJour._sum.gainNet || 0;

      // Vérifier les versements impayés
      const impayes = await this.prisma.versement.findMany({
        where: {
          chauffeurId,
          montantDu: { gt: 0 },
        },
      });

      // Compter les jours avec impayés
      const impayesParJour = new Map<string, number>();
      for (const v of impayes) {
        const dateKey = v.createdAt.toISOString().split('T')[0];
        const reste = v.montantDu - v.montantVerse;
        if (reste > 0) {
          impayesParJour.set(dateKey, (impayesParJour.get(dateKey) || 0) + reste);
        }
      }

      const nbJoursImpayes = impayesParJour.size;
      const totalImpaye = Array.from(impayesParJour.values()).reduce((a, b) => a + b, 0);

      // Message pour le chauffeur
      let messageVersement = '';
      let doitVerser = false;

      if (gainNetJour > 0) {
        doitVerser = true;
        messageVersement = `💰 CA net du jour : ${gainNetJour.toLocaleString()} Ar. Pensez à effectuer votre versement !`;
      }

      if (nbJoursImpayes >= 2) {
        messageVersement += ` ⚠️ ${nbJoursImpayes} jours de versements impayés (${totalImpaye.toLocaleString()} Ar).`;
      }

      if (nbJoursImpayes >= 3) {
        // Bloquer le chauffeur
        await this.prisma.chauffeur.update({
          where: { id: chauffeurId },
          data: { actif: false },
        });
        messageVersement += ' 🚫 COMPTE BLOQUÉ - 3 versements impayés. Contactez l\'administration.';

        // Créer une notification
        await this.prisma.notification.create({
          data: {
            titre: '🚫 Compte bloqué',
            message: `Bonjour ${chauffeur.nom},\n\nVotre compte a été bloqué car vous avez 3 jours de versements impayés (${totalImpaye.toLocaleString()} Ar).\n\nVeuillez régulariser votre situation auprès de l'administration.\n\nMerci.`,
            type: 'BLOQUAGE',
          },
        });
      }

      // Créer le versement du jour automatiquement si CA > 0
      if (gainNetJour > 0) {
        await this.prisma.versement.create({
          data: {
            chauffeurId,
            montantDu: gainNetJour,
            montantVerse: 0,
            statut: 'EN_ATTENTE',
          },
        });
      }
    }

    // Mise à jour du statut
    const statutMap: Record<string, string> = {
      ARRIVEE: 'EN_SERVICE',
      PAUSE: 'EN_PAUSE',
      REPRISE: 'EN_SERVICE',
      FIN_SERVICE: 'HORS_SERVICE',
    };

    const nouveauStatut = statutMap[type] || chauffeur.statut;

    await this.prisma.chauffeur.update({
      where: { id: chauffeurId },
      data: { statut: nouveauStatut },
    });

    const pointage = await this.prisma.pointage.create({
      data: { chauffeurId, type },
      include: { chauffeur: true },
    });

    // Vérifier les impayés après mise à jour
    const nbImpayesFinal = await this.prisma.versement.count({
      where: {
        chauffeurId,
        statut: 'EN_ATTENTE',
        montantVerse: 0,
      },
    });

    const messages: Record<string, string> = {
      ARRIVEE: '✅ Départ enregistré ! Bonne journée 🏍️',
      PAUSE: '⏸️ Pause enregistrée',
      REPRISE: '🔄 Reprise enregistrée',
      FIN_SERVICE: '🏁 Service terminé. À demain !',
    };

    return {
      ...pointage,
      message: messages[type] || 'Pointage enregistré',
      nouveauStatut,
      versement: type === 'FIN_SERVICE' ? {
        gainNetJour,
        nbImpayes: nbImpayesFinal,
        messageVersement,
        doitVerser: gainNetJour > 0,
      } : null,
    };
  }
}

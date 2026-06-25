import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertesService {
  constructor(private prisma: PrismaService) {}

  async getAlertesChauffeur(chauffeurId: string) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: { moto: true },
    });

    if (!chauffeur) return { alertes: [], has_alertes: false };

    const alertes: any[] = [];

    // Vérifier si le chauffeur a une moto
    if (chauffeur.moto) {
      const moto = chauffeur.moto;
      
      // Alerte vidange (simulée - on pourrait ajouter kmProchaineVidange au modèle)
      const kmRestant = (moto as any).kmProchaineVidange 
        ? (moto as any).kmProchaineVidange - moto.kmActuel 
        : null;

      if (kmRestant !== null && kmRestant <= 500 && kmRestant > 0) {
        alertes.push({
          type: 'warning',
          moto_immat: moto.immatriculation,
          message: '⚠️ Vidange bientôt nécessaire !',
          km_restant: kmRestant,
        });
      }

      if (kmRestant !== null && kmRestant <= 0) {
        alertes.push({
          type: 'danger',
          moto_immat: moto.immatriculation,
          message: '🔴 VIDANGE OBLIGATOIRE ! Kilométrage dépassé.',
          km_restant: Math.abs(kmRestant),
        });
      }
    } else {
      alertes.push({
        type: 'danger',
        message: '⚠️ Aucune moto assignée ! Contactez l\'administration.',
      });
    }

    // Vérifier si le chauffeur est bloqué
    const versementsImpayes = await this.prisma.versement.count({
      where: { chauffeurId, statut: { not: 'VALIDE' } },
    });

    if (versementsImpayes >= 3) {
      alertes.push({
        type: 'danger',
        message: '🚫 Compte bloqué - ' + versementsImpayes + ' versements impayés',
      });
    }

    return {
      alertes,
      has_alertes: alertes.length > 0,
    };
  }
}

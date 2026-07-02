import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParametresService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const params = await this.prisma.parametre.findMany();
    const result: any = {};
    for (const p of params) result[p.nom] = p.valeur;
    return {
      prix_base: parseInt(result.prix_base) || 2000,
      prix_km: parseFloat(result.prix_km) || 500,
      tarif_location_journalier: parseInt(result.tarif_location_journalier) || 15000,
      theme: result.theme || 'clair',
      couleur_principale: result.couleur_principale || '#DAA520',
      // Ajouter les abonnements
      abonnement_2_5_prix_mensuel: result.abonnement_2_5_prix_mensuel || '50000',
      abonnement_6_10_prix_mensuel: result.abonnement_6_10_prix_mensuel || '90000',
      abonnement_11_plus_prix_mensuel: result.abonnement_11_plus_prix_mensuel || '150000',
      reduction_annuelle_pourcent: result.reduction_annuelle_pourcent || '7',
      max_motos_gratuit: result.max_motos_gratuit || '1',
    };
  }

  // Nouvel endpoint pour la Landing Page (retourne tout)
  async getAllRaw() {
    return this.prisma.parametre.findMany();
  }

  async saveGeneral(data: any) {
    if (data.prix_base) await this.upsert('prix_base', String(data.prix_base));
    if (data.prix_km) await this.upsert('prix_km', String(data.prix_km));
    if (data.tarif_location_journalier) await this.upsert('tarif_location_journalier', String(data.tarif_location_journalier));
    // Sauvegarder aussi les abonnements s'ils sont fournis
    if (data.abonnement_2_5_prix_mensuel) await this.upsert('abonnement_2_5_prix_mensuel', String(data.abonnement_2_5_prix_mensuel));
    if (data.abonnement_6_10_prix_mensuel) await this.upsert('abonnement_6_10_prix_mensuel', String(data.abonnement_6_10_prix_mensuel));
    if (data.abonnement_11_plus_prix_mensuel) await this.upsert('abonnement_11_plus_prix_mensuel', String(data.abonnement_11_plus_prix_mensuel));
    if (data.reduction_annuelle_pourcent) await this.upsert('reduction_annuelle_pourcent', String(data.reduction_annuelle_pourcent));
    if (data.max_motos_gratuit) await this.upsert('max_motos_gratuit', String(data.max_motos_gratuit));
    return { success: true, message: 'Paramètres mis à jour' };
  }

  async saveStyle(data: { theme: string; couleur_principale: string }) {
    await this.upsert('theme', data.theme);
    await this.upsert('couleur_principale', data.couleur_principale);
    return { success: true, message: 'Style mis à jour' };
  }

  async getTypesAutorises() {
    const types = await this.prisma.parametre.findFirst({ where: { nom: 'types_courses_autorises' } });
    const defaut = ['NORMALE', 'ADY_VAROTRA', 'LOCATION_JOURNALIERE'];
    return { types: types?.valeur ? JSON.parse(types.valeur) : defaut };
  }

  async setTypesAutorises(types: string[]) {
    await this.upsert('types_courses_autorises', JSON.stringify(types));
    return { success: true, types };
  }

  async coupEnvoi(types: string[], heure: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    await this.prisma.pointage.deleteMany({ where: { datePointage: { gte: today } } });
    await this.prisma.chauffeur.updateMany({ data: { statut: 'HORS_SERVICE' } });
    await this.upsert('types_courses_autorises', JSON.stringify(types));
    await this.upsert('coup_envoi_heure', heure);
    await this.upsert('coup_envoi_actif', '1');
    return { success: true, message: `Coup d'envoi à ${heure}`, types };
  }

  async getCoupEnvoi() {
    const actif = await this.prisma.parametre.findFirst({ where: { nom: 'coup_envoi_actif' } });
    const heure = await this.prisma.parametre.findFirst({ where: { nom: 'coup_envoi_heure' } });
    return { actif: actif?.valeur === '1', heure: heure?.valeur || '07:00' };
  }

  private async upsert(nom: string, valeur: string) {
    const existant = await this.prisma.parametre.findUnique({ where: { nom } });
    if (existant) {
      await this.prisma.parametre.update({ where: { nom }, data: { valeur } });
    } else {
      await this.prisma.parametre.create({ data: { nom, valeur } });
    }
  }
}

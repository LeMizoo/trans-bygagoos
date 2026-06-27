import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParametresService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const params = await this.prisma.parametre.findMany();
    const result: any = {};
    for (const p of params) {
      result[p.nom] = p.valeur;
    }
    return {
      prix_base: parseInt(result.prix_base) || 2000,
      prix_km: parseFloat(result.prix_km) || 500,
      tarif_location_journalier: parseInt(result.tarif_location_journalier) || 15000,
      theme: result.theme || 'clair',
      couleur_principale: result.couleur_principale || '#DAA520',
    };
  }

  async saveGeneral(data: { prix_base: number; prix_km: number; tarif_location_journalier: number }) {
    await this.upsert('prix_base', String(data.prix_base));
    await this.upsert('prix_km', String(data.prix_km));
    await this.upsert('tarif_location_journalier', String(data.tarif_location_journalier));
    return { success: true, message: 'Paramètres mis à jour' };
  }

  async saveStyle(data: { theme: string; couleur_principale: string }) {
    await this.upsert('theme', data.theme);
    await this.upsert('couleur_principale', data.couleur_principale);
    return { success: true, message: 'Style mis à jour' };
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

  // Types de courses autorisés
  async getTypesAutorises() {
    const types = await this.prisma.parametre.findFirst({
      where: { nom: 'types_courses_autorises' },
    });
    const defaut = ['NORMALE', 'ADY_VAROTRA', 'LOCATION_JOURNALIERE'];
    return {
      types: types?.valeur ? JSON.parse(types.valeur) : defaut,
      actif: types?.valeur ? true : false,
    };
  }

  async setTypesAutorises(types: string[]) {
    await this.upsert('types_courses_autorises', JSON.stringify(types));
    return { success: true, types };
  }

  // Coup d'envoi avec types
  async coupEnvoi(types: string[], heure: string) {
    // Réinitialiser les pointages du jour
    const today = new Date(); today.setHours(0, 0, 0, 0);
    await this.prisma.pointage.deleteMany({ where: { datePointage: { gte: today } } });
    await this.prisma.chauffeur.updateMany({ data: { statut: 'HORS_SERVICE' } });
    
    // Sauvegarder les types autorisés
    await this.upsert('types_courses_autorises', JSON.stringify(types));
    await this.upsert('coup_envoi_heure', heure);
    await this.upsert('coup_envoi_actif', '1');
    
    return {
      success: true,
      message: `Coup d'envoi lancé à ${heure} avec ${types.length} type(s) de course autorisé(s)`,
      types,
    };
  }

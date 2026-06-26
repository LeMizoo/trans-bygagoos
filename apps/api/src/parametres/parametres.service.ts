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

import { Injectable } from '@nestjs/common';

@Injectable()
export class VersementsService {
  private versements = [
    { id: '1', date: '2026-07-17', chauffeur: 'Koto Be', telephone: '034 00 000 01', montantDu: 50000, montantVerse: 30000, resteAPayer: 20000, statut: 'partiel' },
    { id: '2', date: '2026-07-17', chauffeur: 'Doda Tsiry', telephone: '034 00 000 02', montantDu: 45000, montantVerse: 0, resteAPayer: 45000, statut: 'en_attente' },
    { id: '3', date: '2026-07-16', chauffeur: 'Jean Rakoto', telephone: '034 00 000 03', montantDu: 60000, montantVerse: 60000, resteAPayer: 0, statut: 'paye', modePaiement: 'mobile_money', reference: 'MVola-12345' },
    { id: '4', date: '2026-07-16', chauffeur: 'Marie Rasoa', telephone: '034 00 000 04', montantDu: 35000, montantVerse: 15000, resteAPayer: 20000, statut: 'partiel' },
    { id: '5', date: '2026-07-15', chauffeur: 'Lala Nomena', telephone: '034 00 000 05', montantDu: 55000, montantVerse: 0, resteAPayer: 55000, statut: 'en_attente' },
  ];

  findAll(statut?: string) {
    if (statut && statut !== 'tous') return this.versements.filter(v => v.statut === statut);
    return this.versements;
  }

  create(data: any) {
    const nouvel = { id: String(this.versements.length + 1), ...data, montantVerse: 0, resteAPayer: data.montantDu, statut: 'en_attente' };
    this.versements.push(nouvel);
    return nouvel;
  }

  update(id: string, data: any) {
    const index = this.versements.findIndex(v => v.id === id);
    if (index >= 0) {
      this.versements[index] = { ...this.versements[index], ...data };
      return this.versements[index];
    }
    return null;
  }
}

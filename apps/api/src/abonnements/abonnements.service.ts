import { Injectable } from '@nestjs/common';

@Injectable()
export class AbonnementsService {
  private abonnements = [
    { id: '1', nom: 'Ma Flotte ByGagoos', type: 'FLOTTE', formule: 'Premium', prix: 50000, statut: 'ACTIF', debut: '2026-01-01', fin: '2027-01-01', vehiculesMax: 50, chauffeursMax: 100 },
    { id: '3', nom: 'Speed Flotte', type: 'FLOTTE', formule: 'Standard', prix: 25000, statut: 'ACTIF', debut: '2026-02-01', fin: '2027-02-01',vehiculesMax: 20, chauffeursMax: 40 },
    { id: '4', nom: 'Taxi Be', type: 'FLOTTE', formule: 'Basic', prix: 10000, statut: 'INACTIF', debut: '2026-06-01', fin: '2027-06-01', vehiculesMax: 5, chauffeursMax: 10 },
    { id: '2', nom: 'Coop Express ByGagoos', type: 'COOP', formule: 'Standard', prix: 30000, statut: 'ACTIF', debut: '2026-03-15', fin: '2027-03-15', vehiculesMax: 30, livreursMax: 60 },
    { id: '5', nom: 'Coop Rapide', type: 'COOP', formule: 'Premium', prix: 60000, statut: 'ACTIF', debut: '2026-05-01', fin: '2027-05-01', vehiculesMax: 100, livreursMax: 200 },
  ];

  findAll() {
    return this.abonnements;
  }

  findByType(type: string) {
    return this.abonnements.filter(a => a.type === type);
  }

  findOne(id: string) {
    return this.abonnements.find(a => a.id === id);
  }

  create(data: any) {
    const nouvel = { id: String(this.abonnements.length + 6), ...data };
    this.abonnements.push(nouvel);
    return nouvel;
  }

  update(id: string, data: any) {
    const index = this.abonnements.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.abonnements[index] = { ...this.abonnements[index], ...data };
    return this.abonnements[index];
  }
}

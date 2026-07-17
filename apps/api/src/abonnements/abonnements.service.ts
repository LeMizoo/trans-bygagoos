import { Injectable } from '@nestjs/common';

@Injectable()
export class AbonnementsService {
  private abonnements = [
    { id: '1', nom: 'Ma Flotte ByGagoos', type: 'FLOTTE', formule: 'Premium', prix: 50000, statut: 'ACTIF', debut: '2026-01-01', fin: '2027-01-01' },
    { id: '2', nom: 'Coop Express ByGagoos', type: 'COOP', formule: 'Standard', prix: 30000, statut: 'ACTIF', debut: '2026-03-15', fin: '2027-03-15' },
  ];

  findAll() {
    return this.abonnements;
  }

  findOne(id: string) {
    return this.abonnements.find(a => a.id === id);
  }

  create(data: any) {
    const nouvel = { id: String(this.abonnements.length + 1), ...data };
    this.abonnements.push(nouvel);
    return nouvel;
  }
}

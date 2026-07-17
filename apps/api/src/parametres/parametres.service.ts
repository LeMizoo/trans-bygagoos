import { Injectable } from '@nestjs/common';

@Injectable()
export class ParametresService {
  private parametres = {
    prixBaseKm: 2000,
    prixParKm: 500,
    tarifLocationJournaliere: 15000,
    commissionFlotte: 15,
    commissionCoop: 10,
    delaiPaiement: 7,
    monnaie: 'Ar',
    langue: 'fr',
    notificationsActives: true,
    maintenanceMode: false,
  };

  findAll() {
    return this.parametres;
  }

  update(data: any) {
    this.parametres = { ...this.parametres, ...data };
    return this.parametres;
  }
}

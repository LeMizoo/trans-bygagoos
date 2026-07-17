import { Injectable } from '@nestjs/common';

@Injectable()
export class DepensesService {
  private categories = [
    { id: '1', nom: '💰 Taxes et impôts', couleur: '#e74c3c' },
    { id: '2', nom: '👥 Salaires - Chauffeurs', couleur: '#3498db' },
    { id: '3', nom: '👔 Salaires - Personnel', couleur: '#2980b9' },
    { id: '4', nom: '🏢 Loyer et charges', couleur: '#9b59b6' },
    { id: '5', nom: '📞 Télécom/Internet', couleur: '#1abc9c' },
    { id: '6', nom: '⚡ Électricité/Eau', couleur: '#f1c40f' },
    { id: '7', nom: '📋 Fournitures bureau', couleur: '#e67e22' },
    { id: '8', nom: '🔧 Entretien local', couleur: '#95a5a6' },
    { id: '9', nom: '📱 Marketing/Publicité', couleur: '#e84393' },
    { id: '10', nom: '🔨 Réparations diverses', couleur: '#d35400' },
    { id: '11', nom: '📦 Divers', couleur: '#7f8c8d' },
  ];

  private depenses = [
    { id: '1', categorieId: '2', categorieNom: 'Salaires - Chauffeurs', couleur: '#3498db', montant: 250000, description: 'Salaire juillet', date: '2026-07-15' },
    { id: '2', categorieId: '4', categorieNom: 'Loyer et charges', couleur: '#9b59b6', montant: 180000, description: 'Loyer juillet', date: '2026-07-10' },
    { id: '3', categorieId: '6', categorieNom: 'Électricité/Eau', couleur: '#f1c40f', montant: 45000, description: 'Facture JIRAMA', date: '2026-07-12' },
    { id: '4', categorieId: '10', categorieNom: 'Réparations diverses', couleur: '#d35400', montant: 75000, description: 'Réparation moto MOTO-003', date: '2026-07-14' },
  ];

  findAll() {
    return { depenses: this.depenses, categories: this.categories };
  }

  create(data: any) {
    const categorie = this.categories.find(c => c.id === data.categorieId);
    const nouvel = {
      id: String(this.depenses.length + 1),
      ...data,
      categorieNom: categorie?.nom || 'Inconnue',
      couleur: categorie?.couleur || '#888',
    };
    this.depenses.push(nouvel);
    return nouvel;
  }

  update(id: string, data: any) {
    const index = this.depenses.findIndex(d => d.id === id);
    if (index >= 0) {
      this.depenses[index] = { ...this.depenses[index], ...data };
      return this.depenses[index];
    }
    return null;
  }

  delete(id: string) {
    this.depenses = this.depenses.filter(d => d.id !== id);
    return { success: true };
  }
}

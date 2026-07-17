import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilisateursService {
  private utilisateurs = [
    { id: '1', username: 'admin', nomComplet: 'Admin ByGagoos', email: 'admin@bygagoos.com', role: 'admin', actif: true },
    { id: '2', username: 'tovoniaina', nomComplet: 'Tovoniaina', email: 'tovoniaina.rahendrison@gmail.com', role: 'admin', actif: true },
    { id: '3', username: 'abela', nomComplet: 'Abela', email: 'abela@me.eu', role: 'user', actif: true },
    { id: '4', username: 'rakoto', nomComplet: 'Rakoto', email: 'rakoto@email.com', role: 'user', actif: true },
    { id: '5', username: 'rafilipo', nomComplet: 'Rafilipo', email: 'rafilipo@moi.eu', role: 'user', actif: false },
  ];

  findAll() {
    return this.utilisateurs;
  }

  create(data: any) {
    const nouvel = { id: String(this.utilisateurs.length + 1), ...data, actif: true };
    this.utilisateurs.push(nouvel);
    return nouvel;
  }

  update(id: string, data: any) {
    const index = this.utilisateurs.findIndex(u => u.id === id);
    if (index >= 0) {
      this.utilisateurs[index] = { ...this.utilisateurs[index], ...data };
      return this.utilisateurs[index];
    }
    return null;
  }

  delete(id: string) {
    this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
    return { success: true };
  }
}

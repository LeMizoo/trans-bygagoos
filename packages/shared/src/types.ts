// Types partagés pour toute l'application Trans-ByGagoos

export interface User {
  id: string;
  email: string;
  nom: string;
  telephone?: string;
  role: 'ADMIN_COOP' | 'LIVREUR';
  actif: boolean;
  coopId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coop {
  id: string;
  nom: string;
  description?: string;
  adresse?: string;
  telephone: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicule {
  id: string;
  coopId: string;
  type: 'MOTO' | 'VOITURE' | 'CAMIONNETTE';
  immatriculation: string;
  modele?: string;
  capacite?: number;
  statut: 'DISPONIBLE' | 'EN_COURSE' | 'MAINTENANCE';
  livreurId?: string;
  kilometrage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Commande {
  id: string;
  coopId: string;
  clientNom: string;
  clientTel: string;
  clientAdresse?: string;
  depart: string;
  arrivee: string;
  description: string;
  type: 'NOURRITURE' | 'ELECTROMENAGER' | 'COLIS' | 'AUTRE';
  urgence: 'NORMAL' | 'URGENT' | 'EXPRESS';
  prix: number;
  paiement: 'A_PAYER' | 'PAYE';
  livreurId?: string;
  vehiculeId?: string;
  statut: 'EN_ATTENTE' | 'ASSIGNEE' | 'EN_COURS' | 'LIVREE' | 'ANNULEE';
  dateCreation: string;
  datePriseEnCharge?: string;
  dateLivraison?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les réponses API
export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}

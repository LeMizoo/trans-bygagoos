import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class FlottesService {
  constructor(private prisma: PrismaService) {}

  async register(data: {
    nomFlotte: string;
    description?: string;
    telephone?: string;
    adresse?: string;
    nom: string;
    email: string;
    password: string;
  }) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Vérifier si le nom de flotte existe déjà
    const existingFlotte = await this.prisma.flotte.findFirst({
      where: { nom: data.nomFlotte },
    });
    if (existingFlotte) {
      throw new ConflictException('Ce nom de flotte existe déjà');
    }

    // Créer la flotte et le propriétaire dans une transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Créer la flotte
      const flotte = await prisma.flotte.create({
        data: {
          nom: data.nomFlotte,
          description: data.description || null,
          telephone: data.telephone || null,
          email: data.email,
          adresse: data.adresse || null,
        },
      });

      // 2. Créer le propriétaire (User)
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          nom: data.nom,
          password: hashedPassword,
          role: 'PROPRIETAIRE',
          flotteId: flotte.id,
        },
      });

      // 3. Créer les paramètres par défaut pour la flotte
      await prisma.parametre.createMany({
        data: [
          { nom: `flotte_${flotte.id}_prix_base`, valeur: '2000', type: 'number' },
          { nom: `flotte_${flotte.id}_prix_km`, valeur: '500', type: 'number' },
          { nom: `flotte_${flotte.id}_tarif_location`, valeur: '15000', type: 'number' },
        ],
      });

      return { flotte, user };
    });

    return {
      success: true,
      message: 'Flotte créée avec succès !',
      flotte: {
        id: result.flotte.id,
        nom: result.flotte.nom,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
    };
  }
}

import { Controller, Post, Get, Body } from '@nestjs/common';
import { FlottesService } from './flottes.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('flottes')
export class FlottesController {
  constructor(
    private readonly service: FlottesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  async register(@Body() data: {
    nomFlotte: string;
    description?: string;
    telephone?: string;
    adresse?: string;
    nom: string;
    email: string;
    password: string;
    logo?: string;
  }) {
    return this.service.register(data);
  }

  @Post('force-seed')
  async forceSeed() {
    const users = await this.prisma.user.findMany({
      where: { role: 'GERANT' },
      include: { flotte: true },
    });
    return { message: `✅ ${users.length} gérants trouvés`, users };
  }

  @Post('fix-gerants')
  async fixGerants() {
    // Récupérer tous les gérants et leurs flottes
    const gerants = await this.prisma.user.findMany({
      where: { role: { in: ['GERANT', 'PROPRIETAIRE'] } },
      include: { flotte: true },
    });

    const results = [];
    for (const g of gerants) {
      // Remettre le mot de passe par défaut
      await this.prisma.user.update({
        where: { id: g.id },
        data: {
          password: await bcrypt.hash('Proprio123!', 10),
          role: 'GERANT',
        },
      });
      results.push({ email: g.email, flotte: g.flotte?.nom, statut: '✅ Réinitialisé' });
    }

    return { message: `✅ ${results.length} gérants corrigés`, results };
  }
}

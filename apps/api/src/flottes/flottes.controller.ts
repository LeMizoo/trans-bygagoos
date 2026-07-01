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
    const existing = await this.prisma.user.findUnique({
      where: { email: 'tovoniaina.rahendrison@gmail.com' },
    });
    if (existing) return { message: '✅ SUPER_ADMIN existe déjà', user: existing.email };

    const admin = await this.prisma.user.create({
      data: {
        email: 'tovoniaina.rahendrison@gmail.com',
        nom: 'Tovoniaina RAHENDRISON',
        password: await bcrypt.hash('ByGagoos@2024!', 10),
        role: 'SUPER_ADMIN',
      },
    });
    return { message: '✅ SUPER_ADMIN créé', user: admin.email };
  }

  @Post('fix-gerants')
  async fixGerants() {
    const gerants = await this.prisma.user.findMany({
      where: { role: { in: ['GERANT', 'PROPRIETAIRE'] } },
      include: { flotte: true },
    });

    const results = [];
    for (const g of gerants) {
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

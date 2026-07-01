import { Controller, Post, Body } from '@nestjs/common';
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

  @Post('restore-flottes')
  async restoreFlottes() {
    const results = [];

    // Rakoto Trans
    let exists = await this.prisma.user.findUnique({ where: { email: 'rakoto@email.com' } });
    if (!exists) {
      const f = await this.prisma.flotte.create({
        data: { nom: 'Rakoto Trans', email: 'rakoto@email.com', telephone: '0341234567' },
      });
      await this.prisma.user.create({
        data: {
          email: 'rakoto@email.com', nom: 'Rakoto Jean',
          password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f.id,
        },
      });
      results.push('✅ Rakoto Trans');
    }

    // Rabe Moto
    exists = await this.prisma.user.findUnique({ where: { email: 'rabe@email.com' } });
    if (!exists) {
      const f = await this.prisma.flotte.create({
        data: { nom: 'Rabe Moto', email: 'rabe@email.com', telephone: '0339876543' },
      });
      await this.prisma.user.create({
        data: {
          email: 'rabe@email.com', nom: 'Rabe Marie',
          password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f.id,
        },
      });
      results.push('✅ Rabe Moto');
    }

    return { message: `✅ ${results.length} flottes restaurées`, results };
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { FlottesService } from './flottes.service';
import { PrismaService } from '../prisma/prisma.service';

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

  @Post('restore-all')
  async restoreAll() {
    const results = [];

    // Flotte 1
    let f1 = await this.prisma.flotte.findFirst({ where: { nom: 'Rakoto Trans' } });
    if (!f1) f1 = await this.prisma.flotte.create({ data: { nom: 'Rakoto Trans', email: 'rakoto@email.com', telephone: '0341234567' } });

    let g1 = await this.prisma.user.findUnique({ where: { email: 'rakoto@email.com' } });
    if (!g1) {
      const bcrypt = require('bcrypt');
      await this.prisma.user.create({
        data: { email: 'rakoto@email.com', nom: 'Rakoto Jean', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f1.id },
      });
      results.push('Gérant Rakoto');
    }

    for (const ch of [{ c: 'CH001', n: 'Andry', t: '0321111111' }, { c: 'CH002', n: 'Hery', t: '0321111112' }]) {
      const e = await this.prisma.chauffeur.findFirst({ where: { codeAcces: ch.c, flotteId: f1.id } });
      if (!e) {
        await this.prisma.chauffeur.create({ data: { codeAcces: ch.c, nom: ch.n, telephone: ch.t, pin: '1234', flotteId: f1.id, solde: 50000 } });
        results.push(ch.c + ' Rakoto');
      }
    }

    // Flotte 2
    let f2 = await this.prisma.flotte.findFirst({ where: { nom: 'Rabe Moto' } });
    if (!f2) f2 = await this.prisma.flotte.create({ data: { nom: 'Rabe Moto', email: 'rabe@email.com', telephone: '0339876543' } });

    let g2 = await this.prisma.user.findUnique({ where: { email: 'rabe@email.com' } });
    if (!g2) {
      const bcrypt = require('bcrypt');
      await this.prisma.user.create({
        data: { email: 'rabe@email.com', nom: 'Rabe Marie', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f2.id },
      });
      results.push('Gérant Rabe');
    }

    for (const ch of [{ c: 'CH001', n: 'Fidy', t: '0322222221' }, { c: 'CH002', n: 'Lala', t: '0322222222' }, { c: 'CH003', n: 'Mamy', t: '0322222223' }]) {
      const e = await this.prisma.chauffeur.findFirst({ where: { codeAcces: ch.c, flotteId: f2.id } });
      if (!e) {
        await this.prisma.chauffeur.create({ data: { codeAcces: ch.c, nom: ch.n, telephone: ch.t, pin: '1234', flotteId: f2.id, solde: 50000 } });
        results.push(ch.c + ' Rabe');
      }
    }

    return { message: `✅ ${results.length} restaurés`, results };
  }
}

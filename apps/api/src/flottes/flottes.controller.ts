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

  @Post('restore-all')
  async restoreAll() {
    const results = [];

    // === FLOTTE 1 : Rakoto Trans ===
    let flotte1 = await this.prisma.flotte.findFirst({ where: { nom: 'Rakoto Trans' } });
    if (!flotte1) {
      flotte1 = await this.prisma.flotte.create({
        data: { nom: 'Rakoto Trans', email: 'rakoto@email.com', telephone: '0341234567' },
      });
    }

    // Gérant
    let gerant1 = await this.prisma.user.findUnique({ where: { email: 'rakoto@email.com' } });
    if (!gerant1) {
      gerant1 = await this.prisma.user.create({
        data: { email: 'rakoto@email.com', nom: 'Rakoto Jean', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: flotte1.id },
      });
      results.push('✅ Gérant Rakoto Jean');
    }

    // Chauffeurs flotte 1
    const chauffeurs1 = [
      { code: 'CH001', nom: 'Andry', tel: '0321111111' },
      { code: 'CH002', nom: 'Hery', tel: '0321111112' },
    ];
    for (const ch of chauffeurs1) {
      const exists = await this.prisma.chauffeur.findFirst({ where: { codeAcces: ch.code, flotteId: flotte1.id } });
      if (!exists) {
        await this.prisma.chauffeur.create({
          data: { codeAcces: ch.code, nom: ch.nom, telephone: ch.tel, pin: '1234', flotteId: flotte1.id, solde: 50000 },
        });
        results.push(`✅ ${ch.code} - ${ch.nom} (Rakoto Trans)`);
      }
    }

    // === FLOTTE 2 : Rabe Moto ===
    let flotte2 = await this.prisma.flotte.findFirst({ where: { nom: 'Rabe Moto' } });
    if (!flotte2) {
      flotte2 = await this.prisma.flotte.create({
        data: { nom: 'Rabe Moto', email: 'rabe@email.com', telephone: '0339876543' },
      });
    }

    // Gérant
    let gerant2 = await this.prisma.user.findUnique({ where: { email: 'rabe@email.com' } });
    if (!gerant2) {
      gerant2 = await this.prisma.user.create({
        data: { email: 'rabe@email.com', nom: 'Rabe Marie', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: flotte2.id },
      });
      results.push('✅ Gérant Rabe Marie');
    }

    // Chauffeurs flotte 2
    const chauffeurs2 = [
      { code: 'CH001', nom: 'Fidy', tel: '0322222221' },
      { code: 'CH002', nom: 'Lala', tel: '0322222222' },
      { code: 'CH003', nom: 'Mamy', tel: '0322222223' },
    ];
    for (const ch of chauffeurs2) {
      const exists = await this.prisma.chauffeur.findFirst({ where: { codeAcces: ch.code, flotteId: flotte2.id } });
      if (!exists) {
        await this.prisma.chauffeur.create({
          data: { codeAcces: ch.code, nom: ch.nom, telephone: ch.tel, pin: '1234', flotteId: flotte2.id, solde: 50000 },
        });
        results.push(`✅ ${ch.code} - ${ch.nom} (Rabe Moto)`);
      }
    }

    return { message: `✅ ${results.length} éléments restaurés`, results };
  }
}

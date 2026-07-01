import { Controller, Post, Get, Put, Param, Body, Delete } from '@nestjs/common';
import { FlottesService } from './flottes.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('flottes')
export class FlottesController {
  constructor(
    private readonly service: FlottesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll() {
    return this.prisma.flotte.findMany({
      select: { id: true, nom: true, logo: true, email: true, telephone: true, statut: true, abonnement: true, description: true, dateFinAbonnement: true, createdAt: true, _count: { select: { motos: true, chauffeurs: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.flotte.findUnique({
      where: { id },
      include: { _count: { select: { motos: true, chauffeurs: true, users: true } } },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.flotte.update({ where: { id }, data });
  }

  @Post(':id/valider')
  async valider(@Param('id') id: string) {
    await this.prisma.flotte.update({ where: { id }, data: { statut: 'ACTIF', dateValidation: new Date() } });
    return { success: true };
  }

  @Post(':id/rejeter')
  async rejeter(@Param('id') id: string) {
    await this.prisma.flotte.update({ where: { id }, data: { statut: 'REJETE' } });
    return { success: true };
  }

  @Post(':id/reevaluer')
  async reevaluer(@Param('id') id: string) {
    const flotte = await this.prisma.flotte.findUnique({ where: { id }, include: { _count: { select: { motos: true } } } });
    if (!flotte) return { error: 'Flotte non trouvée' };
    const nbMotos = flotte._count?.motos || 0;
    let abonnement = 'GRATUIT';
    if (nbMotos >= 11) abonnement = '11_PLUS';
    else if (nbMotos >= 6) abonnement = '6_10';
    else if (nbMotos >= 2) abonnement = '2_5';
    await this.prisma.flotte.update({ where: { id }, data: { abonnement } });
    return { success: true, nbMotos, abonnement };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.prisma.flotte.delete({ where: { id } });
    return { success: true };
  }

  @Post('register')
  async register(@Body() data: any) { return this.service.register(data); }

  @Post('seed-test')
  async seedTest() {
    const bcrypt = require('bcrypt');
    const results: string[] = [];
    const data = [
      { nom: 'Abela Trans', email: 'abela@me.eu', tel: '+261384512345', statut: 'ACTIF', abo: 'GRATUIT', motos: [{ imm: '4321TCE', marque: 'Yamaha', modele: 'Cygnus', km: 74520, couleur: 'Blanc' }], chauffeurs: [{ code: 'AB001', nom: 'Kiks Kely', tel: '+26138000001' }] },
      { nom: 'Tana Moto', email: 'tana@moto.mg', tel: '+261320000001', statut: 'ACTIF', abo: '2_5', motos: [{ imm: '1111TAB', marque: 'Honda', modele: 'CG125', km: 12000 }, { imm: '2222TAC', marque: 'Suzuki', modele: 'GN125', km: 8000 }, { imm: '3333TAD', marque: 'Yamaha', modele: 'YBR125', km: 25000 }], chauffeurs: [{ code: 'TM001', nom: 'Rija', tel: '+26133000001' }, { code: 'TM002', nom: 'Mamy', tel: '+26133000002' }], finAbo: '2026-08-01' },
      { nom: 'Tamatave Express', email: 'tamatave@express.mg', tel: '+261340000001', statut: 'ACTIF', abo: '6_10', motos: [{ imm: '4444TAE', marque: 'Bajaj', modele: 'Boxer', km: 5000 }, { imm: '5555TAF', marque: 'Bajaj', modele: 'Boxer', km: 6000 }, { imm: '6666TAG', marque: 'TVS', modele: 'Apache', km: 4000 }, { imm: '7777TAH', marque: 'TVS', modele: 'Apache', km: 7000 }, { imm: '8888TAI', marque: 'Hero', modele: 'Splendor', km: 3000 }, { imm: '9999TAJ', marque: 'Hero', modele: 'Splendor', km: 9000 }, { imm: '1010TAK', marque: 'Bajaj', modele: 'Discover', km: 2000 }], chauffeurs: [{ code: 'TE001', nom: 'Doda', tel: '+26135000001' }, { code: 'TE002', nom: 'Fetra', tel: '+26135000002' }, { code: 'TE003', nom: 'Liva', tel: '+26135000003' }, { code: 'TE004', nom: 'Niry', tel: '+26135000004' }, { code: 'TE005', nom: 'Solo', tel: '+26135000005' }], finAbo: '2027-01-01' },
      { nom: 'Majunga Ride', email: 'majunga@ride.mg', tel: '+261360000001', statut: 'ACTIF', abo: '11_PLUS', motos: [{ imm: '1212TAL', marque: 'Yamaha', modele: 'MT15', km: 1000 }, { imm: '1313TAM', marque: 'Yamaha', modele: 'MT15', km: 2000 }, { imm: '1414TAN', marque: 'Kawasaki', modele: 'KLX', km: 500 }, { imm: '1515TAO', marque: 'Kawasaki', modele: 'KLX', km: 800 }], chauffeurs: [{ code: 'MR001', nom: 'Haja', tel: '+26137000001' }, { code: 'MR002', nom: 'Bema', tel: '+26137000002' }] },
      { nom: 'Diégo Speed', email: 'diego@speed.mg', tel: '+261380000001', statut: 'ACTIF', abo: '2_5', motos: [{ imm: '2424TAX', marque: 'Yamaha', modele: 'XSR155', km: 5000 }, { imm: '2525TAY', marque: 'Yamaha', modele: 'XSR155', km: 4000 }, { imm: '2626TAZ', marque: 'Honda', modele: 'CB125R', km: 6000 }], chauffeurs: [{ code: 'DS001', nom: 'Njaka', tel: '+26139000001' }, { code: 'DS002', nom: 'Nantenaina', tel: '+26139000002' }] },
    ];

    for (const d of data) {
      let f = await this.prisma.flotte.findFirst({ where: { nom: d.nom } });
      if (!f) {
        f = await this.prisma.flotte.create({ data: { nom: d.nom, email: d.email, telephone: d.tel, statut: d.statut, abonnement: d.abo, dateFinAbonnement: d.finAbo ? new Date(d.finAbo) : null } });
        await this.prisma.user.create({ data: { email: d.email, nom: d.nom, password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f.id } });
        for (const m of d.motos) { await this.prisma.moto.create({ data: { ...m, immatriculation: m.imm, flotteId: f.id } }); }
        for (const c of d.chauffeurs) { await this.prisma.chauffeur.create({ data: { ...c, codeAcces: c.code, telephone: c.tel, pin: '1234', flotteId: f.id, solde: 50000 } }); }
        results.push('✅ ' + d.nom);
      } else { results.push('⏭️ ' + d.nom); }
    }
    return { message: `${results.filter(r => r.startsWith('✅')).length} créées`, results };
  }
}

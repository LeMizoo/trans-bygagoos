import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
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

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.prisma.flotte.delete({ where: { id } });
    return { success: true };
  }

  @Post('register')
  async register(@Body() data: any) {
    return this.service.register(data);
  }

  @Post('seed-test')
  async seedTest() {
    const bcrypt = require('bcrypt');
    const results = [];

    // === 1. Abela Trans (EN ATTENTE - pour tester validation) ===
    let f = await this.prisma.flotte.findFirst({ where: { nom: 'Abela Trans' } });
    if (!f) {
      f = await this.prisma.flotte.create({ data: { nom: 'Abela Trans', email: 'abela@me.eu', telephone: '+261384512345', statut: 'EN_ATTENTE', abonnement: 'GRATUIT' } });
      await this.prisma.user.create({ data: { email: 'abela@me.eu', nom: 'Abela RAHENDRISON', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f.id } });
      await this.prisma.moto.createMany({ data: [
        { immatriculation: '4321TCE', marque: 'Yamaha', modele: 'Cygnus', flotteId: f.id, kmActuel: 74520, couleur: 'Blanc' },
      ]});
      await this.prisma.chauffeur.createMany({ data: [
        { codeAcces: 'AB001', nom: 'Kiks Kely', telephone: '+26138000001', pin: '1234', flotteId: f.id, solde: 50000 },
      ]});
      results.push('✅ Abela Trans (EN_ATTENTE)');
    } else results.push('⏭️ Abela Trans existe');

    // === 2. Tana Moto (ACTIF - 2-5 motos) ===
    f = await this.prisma.flotte.findFirst({ where: { nom: 'Tana Moto' } });
    if (!f) {
      f = await this.prisma.flotte.create({ data: { nom: 'Tana Moto', email: 'tana@moto.mg', telephone: '+261320000001', statut: 'ACTIF', abonnement: '2_5', dateFinAbonnement: new Date('2026-08-01') } });
      await this.prisma.user.create({ data: { email: 'tana@moto.mg', nom: 'Tana Gérant', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f.id } });
      await this.prisma.moto.createMany({ data: [
        { immatriculation: '1111TAB', marque: 'Honda', modele: 'CG 125', flotteId: f.id, kmActuel: 12000, couleur: 'Rouge' },
        { immatriculation: '2222TAC', marque: 'Suzuki', modele: 'GN 125', flotteId: f.id, kmActuel: 8000, couleur: 'Bleu' },
        { immatriculation: '3333TAD', marque: 'Yamaha', modele: 'YBR 125', flotteId: f.id, kmActuel: 25000, couleur: 'Noir' },
      ]});
      await this.prisma.chauffeur.createMany({ data: [
        { codeAcces: 'TM001', nom: 'Rija', telephone: '+26133000001', pin: '1234', flotteId: f.id, solde: 50000 },
        { codeAcces: 'TM002', nom: 'Mamy', telephone: '+26133000002', pin: '1234', flotteId: f.id, solde: 30000 },
      ]});
      results.push('✅ Tana Moto (ACTIF, 2_5)');
    } else results.push('⏭️ Tana Moto existe');

    // === 3. Tamatave Express (ACTIF - 6-10 motos) ===
    f = await this.prisma.flotte.findFirst({ where: { nom: 'Tamatave Express' } });
    if (!f) {
      f = await this.prisma.flotte.create({ data: { nom: 'Tamatave Express', email: 'tamatave@express.mg', telephone: '+261340000001', statut: 'ACTIF', abonnement: '6_10', dateFinAbonnement: new Date('2027-01-01') } });
      await this.prisma.user.create({ data: { email: 'tamatave@express.mg', nom: 'Toamasina Gérant', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f.id } });
      await this.prisma.moto.createMany({ data: [
        { immatriculation: '4444TAE', marque: 'Bajaj', modele: 'Boxer', flotteId: f.id, kmActuel: 5000 },
        { immatriculation: '5555TAF', marque: 'Bajaj', modele: 'Boxer', flotteId: f.id, kmActuel: 6000 },
        { immatriculation: '6666TAG', marque: 'TVS', modele: 'Apache', flotteId: f.id, kmActuel: 4000 },
        { immatriculation: '7777TAH', marque: 'TVS', modele: 'Apache', flotteId: f.id, kmActuel: 7000 },
        { immatriculation: '8888TAI', marque: 'Hero', modele: 'Splendor', flotteId: f.id, kmActuel: 3000 },
        { immatriculation: '9999TAJ', marque: 'Hero', modele: 'Splendor', flotteId: f.id, kmActuel: 9000 },
        { immatriculation: '1010TAK', marque: 'Bajaj', modele: 'Discover', flotteId: f.id, kmActuel: 2000 },
      ]});
      await this.prisma.chauffeur.createMany({ data: [
        { codeAcces: 'TE001', nom: 'Doda', telephone: '+26135000001', pin: '1234', flotteId: f.id, solde: 80000 },
        { codeAcces: 'TE002', nom: 'Fetra', telephone: '+26135000002', pin: '1234', flotteId: f.id, solde: 60000 },
        { codeAcces: 'TE003', nom: 'Liva', telephone: '+26135000003', pin: '1234', flotteId: f.id, solde: 70000 },
        { codeAcces: 'TE004', nom: 'Niry', telephone: '+26135000004', pin: '1234', flotteId: f.id, solde: 40000 },
        { codeAcces: 'TE005', nom: 'Solo', telephone: '+26135000005', pin: '1234', flotteId: f.id, solde: 55000 },
      ]});
      results.push('✅ Tamatave Express (ACTIF, 6_10)');
    } else results.push('⏭️ Tamatave Express existe');

    // === 4. Majunga Ride (EN_ATTENTE) ===
    f = await this.prisma.flotte.findFirst({ where: { nom: 'Majunga Ride' } });
    if (!f) {
      f = await this.prisma.flotte.create({ data: { nom: 'Majunga Ride', email: 'majunga@ride.mg', telephone: '+261360000001', statut: 'EN_ATTENTE', abonnement: '11_PLUS' } });
      await this.prisma.user.create({ data: { email: 'majunga@ride.mg', nom: 'Majunga Gérant', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f.id } });
      await this.prisma.moto.createMany({ data: [
        { immatriculation: '1212TAL', marque: 'Yamaha', modele: 'MT-15', flotteId: f.id, kmActuel: 1000 },
        { immatriculation: '1313TAM', marque: 'Yamaha', modele: 'MT-15', flotteId: f.id, kmActuel: 2000 },
        { immatriculation: '1414TAN', marque: 'Kawasaki', modele: 'KLX', flotteId: f.id, kmActuel: 500 },
        { immatriculation: '1515TAO', marque: 'Kawasaki', modele: 'KLX', flotteId: f.id, kmActuel: 800 },
        { immatriculation: '1616TAP', marque: 'Honda', modele: 'CRF', flotteId: f.id, kmActuel: 300 },
        { immatriculation: '1717TAQ', marque: 'Honda', modele: 'CRF', flotteId: f.id, kmActuel: 600 },
        { immatriculation: '1818TAR', marque: 'Suzuki', modele: 'DR-Z', flotteId: f.id, kmActuel: 1500 },
        { immatriculation: '1919TAS', marque: 'Suzuki', modele: 'DR-Z', flotteId: f.id, kmActuel: 900 },
        { immatriculation: '2020TAT', marque: 'CFMoto', modele: 'NK650', flotteId: f.id, kmActuel: 4000 },
        { immatriculation: '2121TAU', marque: 'CFMoto', modele: 'NK650', flotteId: f.id, kmActuel: 3500 },
        { immatriculation: '2222TAV', marque: 'Benelli', modele: 'TRK502', flotteId: f.id, kmActuel: 2000 },
        { immatriculation: '2323TAW', marque: 'Benelli', modele: 'TRK502', flotteId: f.id, kmActuel: 1800 },
      ]});
      await this.prisma.chauffeur.createMany({ data: [
        { codeAcces: 'MR001', nom: 'Haja', telephone: '+26137000001', pin: '1234', flotteId: f.id, solde: 100000 },
        { codeAcces: 'MR002', nom: 'Bema', telephone: '+26137000002', pin: '1234', flotteId: f.id, solde: 90000 },
      ]});
      results.push('✅ Majunga Ride (EN_ATTENTE, 11_PLUS)');
    } else results.push('⏭️ Majunga Ride existe');

    // === 5. Diégo Speed ===
    f = await this.prisma.flotte.findFirst({ where: { nom: 'Diégo Speed' } });
    if (!f) {
      f = await this.prisma.flotte.create({ data: { nom: 'Diégo Speed', email: 'diego@speed.mg', telephone: '+261380000001', statut: 'ACTIF', abonnement: '2_5' } });
      await this.prisma.user.create({ data: { email: 'diego@speed.mg', nom: 'Diégo Gérant', password: await bcrypt.hash('Proprio123!', 10), role: 'GERANT', flotteId: f.id } });
      await this.prisma.moto.createMany({ data: [
        { immatriculation: '2424TAX', marque: 'Yamaha', modele: 'XSR155', flotteId: f.id, kmActuel: 5000 },
        { immatriculation: '2525TAY', marque: 'Yamaha', modele: 'XSR155', flotteId: f.id, kmActuel: 4000 },
        { immatriculation: '2626TAZ', marque: 'Honda', modele: 'CB125R', flotteId: f.id, kmActuel: 6000 },
      ]});
      await this.prisma.chauffeur.createMany({ data: [
        { codeAcces: 'DS001', nom: 'Njaka', telephone: '+26139000001', pin: '1234', flotteId: f.id, solde: 45000 },
        { codeAcces: 'DS002', nom: 'Nantenaina', telephone: '+26139000002', pin: '1234', flotteId: f.id, solde: 35000 },
      ]});
      results.push('✅ Diégo Speed (ACTIF, 2_5)');
    } else results.push('⏭️ Diégo Speed existe');

    return { message: `✅ ${results.length} flottes`, results };
  }
}

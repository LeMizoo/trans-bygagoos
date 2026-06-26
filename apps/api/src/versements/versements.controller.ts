import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { VersementsService } from './versements.service';

@Controller('versements')
export class VersementsController {
  constructor(private readonly service: VersementsService) {}

  @Get() findAll() { return this.service.findAll(); }
  
  @Get('chauffeur/:chauffeurId')
  findByChauffeur(@Param('chauffeurId') id: string) {
    return this.service.findByChauffeur(id);
  }

  @Post() create(@Body() data: { chauffeurId: string; montantVerse: number }) {
    return this.service.create(data);
  }

  @Post('multiple')
  async verserMultiple(@Body() data: { chauffeurId: string; versementIds: string[]; montantTotal: number }) {
    const results = [];
    let montantRestant = data.montantTotal;
    
    for (const id of data.versementIds) {
      if (montantRestant <= 0) break;
      const v = await this.service.findOne(id);
      const reste = v.montantDu - v.montantVerse;
      const aVerser = Math.min(reste, montantRestant);
      
      await this.service.validerPartiel(id, aVerser);
      results.push({ id, verse: aVerser });
      montantRestant -= aVerser;
    }
    
    // Vérifier si le chauffeur peut être débloqué
    const impayes = await this.service.countImpayes(data.chauffeurId);
    if (impayes < 3) {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.chauffeur.update({ where: { id: data.chauffeurId }, data: { actif: true } });
      await prisma.$disconnect();
    }
    
    return { success: true, results };
  }

  @Put(':id/valider') valider(@Param('id') id: string) { return this.service.valider(id); }
  @Put(':id/refuser') refuser(@Param('id') id: string) { return this.service.refuser(id); }
}

import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { VersementsService } from './versements.service';

@Controller('versements')
export class VersementsController {
  constructor(private readonly versementsService: VersementsService) {}

  @Get()
  findAll() {
    return this.versementsService.findAll();
  }

  @Get('chauffeur/:chauffeurId')
  findByChauffeur(@Param('chauffeurId') chauffeurId: string) {
    return this.versementsService.findByChauffeur(chauffeurId);
  }

  @Post()
  create(@Body() data: { chauffeurId: string; montantVerse: number }) {
    return this.versementsService.create(data);
  }

  @Put(':id/valider')
  valider(@Param('id') id: string) {
    return this.versementsService.valider(id);
  }

  @Put(':id/refuser')
  refuser(@Param('id') id: string) {
    return this.versementsService.refuser(id);
  }
}

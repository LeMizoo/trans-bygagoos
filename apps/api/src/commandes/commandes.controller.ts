import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { CommandesService } from './commandes.service';

@Controller('commandes')
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  @Get()
  findAll(@Query('coopId') coopId: string) {
    return this.commandesService.findAll(coopId);
  }

  @Get('livreur/:livreurId')
  findByLivreur(@Param('livreurId') livreurId: string) {
    return this.commandesService.findByLivreur(livreurId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandesService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.commandesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.commandesService.update(id, data);
  }

  @Put(':id/assign')
  assignLivreur(@Param('id') id: string, @Body() body: { livreurId: string; vehiculeId: string }) {
    return this.commandesService.assignLivreur(id, body.livreurId, body.vehiculeId);
  }

  @Put(':id/statut')
  updateStatut(@Param('id') id: string, @Body() body: { statut: string }) {
    return this.commandesService.updateStatut(id, body.statut);
  }
}

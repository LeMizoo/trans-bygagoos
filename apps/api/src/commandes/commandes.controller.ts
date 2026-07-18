import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { CommandesService } from './commandes.service';

@Controller('commandes')
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  @Get()
  async findAll() {
    return this.commandesService.findAll();
  }

  @Get('livreur/:livreurId')
  async findByLivreur(@Param('livreurId') livreurId: string) {
    return this.commandesService.findByLivreur(livreurId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commandesService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.commandesService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.commandesService.update(id, body);
  }

  @Put(':id/assign')
  async assignToLivreur(@Param('id') id: string, @Body() body: any) {
    return this.commandesService.assignToLivreur(id, body.userId);
  }

  @Put(':id/statut')
  async updateStatut(@Param('id') id: string, @Body() body: { statut: string }) {
    return this.commandesService.update(id, { statut: body.statut });
  }
}

import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { LivreursService } from './livreurs.service';

@Controller('livreurs')
export class LivreursController {
  constructor(private readonly livreursService: LivreursService) {}

  @Get()
  findAll(@Query('coopId') coopId: string) {
    return this.livreursService.findAll(coopId);
  }

  @Get('disponibles')
  getDisponibles(@Query('coopId') coopId: string) {
    return this.livreursService.getDisponibles(coopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livreursService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.livreursService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.livreursService.update(id, data);
  }
}

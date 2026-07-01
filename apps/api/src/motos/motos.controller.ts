import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MotosService } from './motos.service';

@Controller('motos')
export class MotosController {
  constructor(private readonly service: MotosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/assigner')
  assigner(@Param('id') id: string, @Body() data: { chauffeurId: string }) {
    return this.service.assignerChauffeur(id, data.chauffeurId);
  }

  @Post(':id/desassigner')
  desassigner(@Param('id') id: string) {
    return this.service.desassigner(id);
  }

  @Post(':id/vidange')
  validerVidange(@Param('id') id: string, @Body() data: any) {
    return this.service.validerVidange(id, data);
  }
}

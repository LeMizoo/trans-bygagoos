import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';

@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly service: ChauffeursService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get('dashboard') getDashboard() { return { message: 'OK' }; }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') delete(@Param('id') id: string) { return this.service.delete(id); }
  @Post(':id/toggle-actif') toggleActif(@Param('id') id: string) { return this.service.toggleActif(id); }
}

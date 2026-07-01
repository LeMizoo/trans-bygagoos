import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';

@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly service: ChauffeursService) {}

  @Post('renouveler-codes') renouvelerCodes() { return this.service.renouvelerTousCodes(); }
  @Get() findAll(@Query('search') search?: string, @Query('flotteId') flotteId?: string) { return this.service.findAll(search, flotteId); }
  @Get(':id/dashboard') getDashboard(@Param('id') id: string) { return this.service.getDashboard(id); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post(':id/renouveler-code') renouvelerCode(@Param('id') id: string) { return this.service.renouvelerCode(id); }
  @Post(':id/toggle-actif') toggleActif(@Param('id') id: string) { return this.service.toggleActif(id); }
  @Post() create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') delete(@Param('id') id: string) { return this.service.delete(id); }
}


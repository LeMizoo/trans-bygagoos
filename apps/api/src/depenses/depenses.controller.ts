import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { DepensesService } from './depenses.service';

@Controller('depenses')
export class DepensesController {
  constructor(private readonly service: DepensesService) {}

  @Get() findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('categorie') categorie?: string) {
    return this.service.findAll(Number(page) || 1, Number(limit) || 20, categorie);
  }
  @Post() create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') delete(@Param('id') id: string) { return this.service.delete(id); }
  @Get('stats') getStats(@Query('periode') periode?: string) { return this.service.stats(periode || 'mois'); }
}

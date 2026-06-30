import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ProprietairesService } from './proprietaires.service';

@Controller('proprietaires')
export class ProprietairesController {
  constructor(private readonly service: ProprietairesService) {}

  @Get() findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.service.findAll(Number(page) || 1, Number(limit) || 15, search || '');
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') delete(@Param('id') id: string) { return this.service.delete(id); }
}

import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { LivreursService } from './livreurs.service';

@Controller('livreurs')
export class LivreursController {
  constructor(private readonly livreursService: LivreursService) {}

  @Get()
  async findAll() {
    return this.livreursService.findAll();
  }

  @Get('disponibles')
  async findAvailable(@Query('cooperativeId') cooperativeId: string) {
    return this.livreursService.findAvailable(cooperativeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.livreursService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.livreursService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.livreursService.update(id, body);
  }
}

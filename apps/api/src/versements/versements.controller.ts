import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { VersementsService } from './versements.service';

@Controller('versements')
export class VersementsController {
  constructor(private readonly service: VersementsService) {}

  @Get()
  findAll(@Query('statut') statut?: string) {
    return this.service.findAll(statut);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }
}

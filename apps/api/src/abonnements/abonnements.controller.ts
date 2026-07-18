import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { AbonnementsService } from './abonnements.service';

@Controller('abonnements')
export class AbonnementsController {
  constructor(private readonly abonnementsService: AbonnementsService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    if (type) return this.abonnementsService.findByType(type);
    return this.abonnementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.abonnementsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.abonnementsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.abonnementsService.update(id, data);
  }
}

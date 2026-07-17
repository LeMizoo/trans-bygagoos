import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AbonnementsService } from './abonnements.service';

@Controller('abonnements')
export class AbonnementsController {
  constructor(private readonly abonnementsService: AbonnementsService) {}

  @Get()
  findAll() {
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
}

import { Controller, Get, Post, Body } from '@nestjs/common';
import { DepensesService } from './depenses.service';

@Controller('depenses')
export class DepensesController {
  constructor(private readonly depensesService: DepensesService) {}

  @Get()
  findAll() {
    return this.depensesService.findAll();
  }

  @Post()
  create(@Body() data: { description: string; montant: number; categorie: string; motoId?: string }) {
    return this.depensesService.create(data);
  }

  @Get('stats')
  stats() {
    return this.depensesService.stats();
  }
}

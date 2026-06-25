import { Controller, Get, Param } from '@nestjs/common';
import { MotosService } from './motos.service';

@Controller('motos')
export class MotosController {
  constructor(private readonly motosService: MotosService) {}

  @Get()
  findAll() { return this.motosService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.motosService.findOne(id); }
}

import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ContratsService } from './contrats.service';

@Controller('contrats')
export class ContratsController {
  constructor(private readonly contratsService: ContratsService) {}

  @Get()
  findAll() {
    return this.contratsService.findAll();
  }

  @Post()
  create(
    @Body()
    data: {
      chauffeurId: string;
      motoId: string;
      type: string;
      montantLocation: number;
      dateDebut: string;
    },
  ) {
    return this.contratsService.create(data);
  }

  @Put(':id/terminer')
  terminer(@Param('id') id: string) {
    return this.contratsService.terminer(id);
  }

  @Put(':id/resilier')
  resilier(@Param('id') id: string) {
    return this.contratsService.resilier(id);
  }
}

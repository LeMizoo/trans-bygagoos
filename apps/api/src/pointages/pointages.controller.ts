import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PointagesService } from './pointages.service';

@Controller('pointages')
export class PointagesController {
  constructor(private readonly pointagesService: PointagesService) {}

  @Get()
  findAll() {
    return this.pointagesService.findAll();
  }

  @Get('chauffeur/:chauffeurId')
  findByChauffeur(@Param('chauffeurId') chauffeurId: string) {
    return this.pointagesService.findByChauffeur(chauffeurId);
  }

  @Post()
  pointer(@Body() data: { chauffeurId: string; type: string }) {
    return this.pointagesService.pointer(data.chauffeurId, data.type);
  }
}

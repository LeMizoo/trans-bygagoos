import { Controller, Get, Param } from '@nestjs/common';
import { AlertesService } from './alertes.service';

@Controller('alertes')
export class AlertesController {
  constructor(private readonly alertesService: AlertesService) {}

  @Get('chauffeur/:chauffeurId')
  getAlertesChauffeur(@Param('chauffeurId') id: string) {
    return this.alertesService.getAlertesChauffeur(id);
  }
}

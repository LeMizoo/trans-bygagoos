import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get() getStats() { return this.dashboardService.getStats(); }
  @Get('top-chauffeurs') getTopChauffeurs() { return this.dashboardService.getTopChauffeurs(); }
  @Get('ca-journalier') getCAjournalier(@Query('days') days?: string) { return this.dashboardService.getCAjournalier(days ? parseInt(days) : 7); }
  @Get('alertes-flotte') getAlertesFlotte() { return this.dashboardService.getAlertesFlotte(); }
}

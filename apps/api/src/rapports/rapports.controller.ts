import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RapportsService } from './rapports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rapports')
@UseGuards(JwtAuthGuard)
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}

  @Get()
  async getRapport() {
    return { message: 'Rapports disponibles', endpoints: ['/dashboard', '/monthly'] };
  }

  @Get('dashboard')
  async getDashboard() {
    return this.rapportsService.getDashboardStats();
  }

  @Get('monthly')
  async getMonthlyRevenue(
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.rapportsService.getMonthlyRevenue(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }
}

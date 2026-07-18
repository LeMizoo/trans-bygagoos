import { Controller, Get, Query, UseGuards, Delete } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const take = pageSize || 50;
    const skip = ((page || 1) - 1) * take;

    return this.logsService.findAll({
      skip,
      take,
      userId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('stats')
  async getStats(@Query('action') action?: string) {
    return this.logsService.getStats(action);
  }

  @Get('recent')
  async getRecentActivities(@Query('limit') limit?: number) {
    return this.logsService.getRecentActivities(limit || 10);
  }

  @Get('logins')
  async getLoginsByDay(@Query('days') days?: number) {
    return this.logsService.getLoginsByDay(days || 30);
  }

  @Delete('cleanup')
  async deleteOldLogs(@Query('days') days?: number) {
    return this.logsService.deleteOldLogs(days || 90);
  }
}

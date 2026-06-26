import { Controller, Get, Query } from '@nestjs/common';
import { JournauxService } from './journaux.service';

@Controller('journaux')
export class JournauxController {
  constructor(private readonly service: JournauxService) {}

  @Get('pointages') getPointages(@Query('date') date?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.getJournalPointages(date, Number(page) || 1, Number(limit) || 20);
  }
  @Get('courses') getCourses(@Query('date') date?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.getJournalCourses(date, Number(page) || 1, Number(limit) || 20);
  }
  @Get('versements') getVersements(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.getJournalVersements(Number(page) || 1, Number(limit) || 20);
  }
  @Get('assistance') getAssistance(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.getJournalAssistance(Number(page) || 1, Number(limit) || 20);
  }
  @Get('stats') getStats() { return this.service.getStatsGlobales(); }
}

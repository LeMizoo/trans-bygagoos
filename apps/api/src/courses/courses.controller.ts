import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('flotteId') flotteId?: string) {
    return this.service.findAll(Number(page) || 1, Number(limit) || 50, flotteId);
  }

  @Get('stats')
  getStats(@Query('flotteId') flotteId?: string) {
    return this.service.getStats(flotteId);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Post('sync')
  syncOffline(@Body() data: any) {
    return this.service.syncOffline(data);
  }
}

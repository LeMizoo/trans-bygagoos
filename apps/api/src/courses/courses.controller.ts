import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Get() findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('flotteId') flotteId?: string) { return this.service.findAll(Number(page), Number(limit), flotteId); }
  @Get('stats') getStats() { return this.service.getStats(); }
  @Post() create(@Body() data: any) { return this.service.create(data); }
  @Post('sync') syncOffline(@Body() data: any) { return this.service.syncOffline(data); }
}

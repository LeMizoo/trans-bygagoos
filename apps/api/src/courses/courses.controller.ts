import { Controller, Get, Post, Body } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get() findAll() { return this.coursesService.findAll(); }
  @Post() create(@Body() data: { chauffeurId: string; motoId: string; type: string; distance?: number; prix?: number }) { return this.coursesService.create(data); }
  @Post('sync') syncOffline(@Body() data: { chauffeurId: string; courses: any[] }) { return this.coursesService.syncOffline(data); }
  @Get('stats') getStats() { return this.coursesService.getStats(); }
}

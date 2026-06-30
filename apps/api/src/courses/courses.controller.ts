import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@User() user: any) {
    return this.coursesService.findAll(user);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE')
  create(@Body() data: { chauffeurId: string; motoId: string; type: string; distance?: number; prix?: number }) {
    return this.coursesService.create(data);
  }

  @Post('sync')
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE')
  syncOffline(@Body() data: { chauffeurId: string; courses: any[] }) {
    return this.coursesService.syncOffline(data);
  }

  @Get('stats')
  getStats(@User() user: any) {
    return this.coursesService.getStats(user);
  }
}

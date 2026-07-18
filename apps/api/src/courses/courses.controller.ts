import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(@Request() req, @Query('userId') userId?: string) {
    if (req.user.role === 'CHAUFFEUR') return this.coursesService.findAll(req.user.id);
    return this.coursesService.findAll(userId);
  }

  @Get('today')
  async getTodayCourses(@Request() req) {
    return this.coursesService.getTodayCourses(req.user.id);
  }

  @Get('stats')
  async getStats(@Request() req, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.coursesService.getStats(
      req.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  async create(@Request() req, @Body() body: any) {
    console.log('🔍 req.user.id:', req.user.id);
    return this.coursesService.create({
      depart: body.depart,
      arrivee: body.arrivee,
      prix: body.prix,
      userId: req.user.id,
      motoId: body.motoId,
    });
  }
}

import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { ProprietaireFilter } from '../auth/proprietaire.filter';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(
    private readonly service: CoursesService,
    private readonly proprioFilter: ProprietaireFilter,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE', 'PROPRIETAIRE')
  async findAll(@Query() query: any, @User() user: any) {
    if (user?.role === 'PROPRIETAIRE' && user?.email) {
      const proprioId = await this.proprioFilter.getProprietaireId(user.email);
      if (!proprioId) return { items: [], total: 0 };
      const motosIds = await this.proprioFilter.getMotosIds(proprioId);
      return this.service.findByMotosIds(motosIds, query.page, query.limit);
    }
    return this.service.findAll(query.page, query.limit);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }
}

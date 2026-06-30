import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DepensesService } from './depenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { ProprietaireFilter } from '../auth/proprietaire.filter';

@Controller('depenses')
@UseGuards(JwtAuthGuard)
export class DepensesController {
  constructor(
    private readonly service: DepensesService,
    private readonly proprioFilter: ProprietaireFilter,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'PROPRIETAIRE')
  async findAll(
    @User() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categorie') categorie?: string,
  ) {
    if (user?.role === 'PROPRIETAIRE' && user?.email) {
      const proprioId = await this.proprioFilter.getProprietaireId(user.email);
      if (!proprioId) return { items: [], total: 0 };
      const motosIds = await this.proprioFilter.getMotosIds(proprioId);
      return this.service.findByMotosIds(motosIds, Number(page) || 1, Number(limit) || 20, categorie);
    }
    return this.service.findAll(Number(page) || 1, Number(limit) || 20, categorie);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  delete(@Param('id') id: string) { return this.service.delete(id); }

  @Get('stats')
  getStats(@Query('periode') periode?: string, @User() user?: any) {
    return this.service.stats(periode || 'mois', user);
  }

  @Get('chauffeur/:chauffeurId')
  getByChauffeur(@Param('chauffeurId') chauffeurId: string) {
    return this.service.findByChauffeur(chauffeurId);
  }
}

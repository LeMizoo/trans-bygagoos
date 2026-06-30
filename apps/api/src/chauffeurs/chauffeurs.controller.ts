import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { ProprietaireFilter } from '../auth/proprietaire.filter';

@Controller('chauffeurs')
@UseGuards(JwtAuthGuard)
export class ChauffeursController {
  constructor(
    private readonly service: ChauffeursService,
    private readonly proprioFilter: ProprietaireFilter,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE', 'PROPRIETAIRE')
  async findAll(@User() user: any, @Query('search') search?: string) {
    if (user?.role === 'PROPRIETAIRE' && user?.email) {
      const proprioId = await this.proprioFilter.getProprietaireId(user.email);
      if (!proprioId) return [];
      return this.service.findByProprietaire(proprioId, search);
    }
    return this.service.findAll();
  }

  @Get('dashboard')
  getDashboard(@User() user: any) {
    return this.service.getDashboard(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE')
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/toggle-actif')
  @Roles('SUPER_ADMIN', 'ADMIN')
  toggleActif(@Param('id') id: string) {
    return this.service.toggleActif(id);
  }
}

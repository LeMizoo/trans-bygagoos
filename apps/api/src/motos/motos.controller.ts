import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MotosService } from './motos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';

@Controller('motos')
@UseGuards(JwtAuthGuard)
export class MotosController {
  constructor(private readonly service: MotosService) {}

  @Get()
  findAll(@User() user: any) {
    return this.service.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: any) {
    return this.service.findOne(id, user);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @User() user: any) {
    return this.service.getStatsMoto(id, user);
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

  @Post(':id/assigner')
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE')
  assigner(@Param('id') id: string, @Body() data: { chauffeurId: string }) {
    return this.service.assignerChauffeur(id, data.chauffeurId);
  }

  @Post(':id/desassigner')
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE')
  desassigner(@Param('id') id: string) {
    return this.service.desassigner(id);
  }

  @Post(':id/vidange')
  @Roles('SUPER_ADMIN', 'ADMIN', 'LOGISTIQUE')
  validerVidange(@Param('id') id: string, @Body() data: any) {
    return this.service.validerVidange(id, data);
  }
}

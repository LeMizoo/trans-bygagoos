import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProprietairesService } from './proprietaires.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';

@Controller('proprietaires')
@UseGuards(JwtAuthGuard)
export class ProprietairesController {
  constructor(private readonly service: ProprietairesService) {}

  @Get()
  findAll(
    @User() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(Number(page) || 1, Number(limit) || 15, search || '', user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

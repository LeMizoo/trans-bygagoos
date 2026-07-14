import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';

@Controller('vehicules')
export class VehiculesController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  @Get()
  findAll(@Query('coopId') coopId: string) {
    return this.vehiculesService.findAll(coopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculesService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.vehiculesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.vehiculesService.update(id, data);
  }
}

import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';

@Controller('vehicules')
export class VehiculesController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  @Get()
  async findAll() {
    return this.vehiculesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehiculesService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.vehiculesService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.vehiculesService.update(id, body);
  }
}

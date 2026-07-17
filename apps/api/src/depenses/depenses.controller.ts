import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { DepensesService } from './depenses.service';

@Controller('depenses')
export class DepensesController {
  constructor(private readonly service: DepensesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { CoopService } from './coop.service';

@Controller('coops')
export class CoopController {
  constructor(private readonly coopService: CoopService) {}

  @Get()
  findAll() {
    return this.coopService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coopService.findOne(id);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { CoopService } from './coop.service';

@Controller('flottes')
export class FlottesController {
  constructor(private readonly coopService: CoopService) {}

  @Get()
  findAll() {
    return this.coopService.findAllFlottes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coopService.findOneFlotte(id);
  }
}

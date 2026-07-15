import { Controller, Get } from '@nestjs/common';
import { CoopService } from './coop.service';

@Controller('flottes')
export class FlottesController {
  constructor(private readonly coopService: CoopService) {}

  @Get()
  findAll() {
    return this.coopService.findAll();
  }
}

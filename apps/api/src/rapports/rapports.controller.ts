import { Controller, Get } from '@nestjs/common';
import { RapportsService } from './rapports.service';

@Controller('rapports')
export class RapportsController {
  constructor(private readonly service: RapportsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}

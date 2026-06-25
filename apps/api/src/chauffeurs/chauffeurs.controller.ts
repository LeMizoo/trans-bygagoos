import { Controller, Get, Param } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';

@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly chauffeursService: ChauffeursService) {}

  @Get()
  findAll() {
    return this.chauffeursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chauffeursService.findOne(id);
  }

  @Get(':id/dashboard')
  getDashboard(@Param('id') id: string) {
    return this.chauffeursService.getDashboard(id);
  }
}

import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { AssistanceService } from './assistance.service';

@Controller('assistance')
export class AssistanceController {
  constructor(private readonly assistanceService: AssistanceService) {}

  @Get()
  findAll() {
    return this.assistanceService.findAll();
  }

  @Post()
  create(@Body() data: { chauffeurId: string; type: string; urgence: string; description: string }) {
    return this.assistanceService.create(data);
  }

  @Put(':id/statut')
  updateStatut(@Param('id') id: string, @Body() data: { statut: string }) {
    return this.assistanceService.updateStatut(id, data.statut);
  }
}

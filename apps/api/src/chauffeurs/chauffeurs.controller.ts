import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';

@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly chauffeursService: ChauffeursService) {}

  @Get()
  findAll(@Query('actif') actif?: string) {
    const filterActif = actif === 'true' ? true : actif === 'false' ? false : undefined;
    return this.chauffeursService.findAll(filterActif);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chauffeursService.findOne(id);
  }

  @Get(':id/dashboard')
  getDashboard(@Param('id') id: string) {
    return this.chauffeursService.getDashboard(id);
  }

  @Put(':id/code')
  updateCode(@Param('id') id: string, @Body() data: { codeAcces: string }) {
    return this.chauffeursService.updateCode(id, data.codeAcces);
  }

  @Put(':id/toggle-actif')
  toggleActif(@Param('id') id: string) {
    return this.chauffeursService.toggleActif(id);
  }

  @Post('renouveler-tous')
  renouvelerTousCodes() {
    return this.chauffeursService.renouvelerTousCodes();
  }

  @Post(':id/renouveler')
  renouvelerCode(@Param('id') id: string) {
    return this.chauffeursService.renouvelerCode(id);
  }
}

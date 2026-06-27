import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';

@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly service: ChauffeursService) {}

  @Get() findAll(@Query('actif') actif?: string) {
    return this.service.findAll(actif === 'true' ? true : actif === 'false' ? false : undefined);
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Get(':id/dashboard') getDashboard(@Param('id') id: string) { return this.service.getDashboard(id); }
  
  @Post() create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') delete(@Param('id') id: string) { return this.service.delete(id); }
  
  @Put(':id/code') updateCode(@Param('id') id: string, @Body() data: { codeAcces: string }) { return this.service.updateCode(id, data.codeAcces); }
  @Put(':id/toggle-actif') toggleActif(@Param('id') id: string) { return this.service.toggleActif(id); }
  @Post('renouveler-tous') renouvelerTousCodes() { return this.service.renouvelerTousCodes(); }
  @Post(':id/renouveler') renouvelerCode(@Param('id') id: string) { return this.service.renouvelerCode(id); }
}

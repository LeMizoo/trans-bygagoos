import { Controller, Get, Post, Body } from '@nestjs/common';
import { ParametresService } from './parametres.service';

@Controller('parametres')
export class ParametresController {
  constructor(private readonly service: ParametresService) {}

  @Get() getAll() { return this.service.getAll(); }
  
  @Post('general') saveGeneral(@Body() data: any) { return this.service.saveGeneral(data); }
  
  @Post('style') saveStyle(@Body() data: any) { return this.service.saveStyle(data); }
  
  @Get('types-autorises') getTypesAutorises() { return this.service.getTypesAutorises(); }
  
  @Post('types-autorises') setTypesAutorises(@Body() data: { types: string[] }) {
    return this.service.setTypesAutorises(data.types);
  }
  
  @Post('coup-envoi') coupEnvoi(@Body() data: { types: string[]; heure: string }) {
    return this.service.coupEnvoi(data.types, data.heure);
  }
  
  @Get('coup-envoi')
  getCoupEnvoi() { return this.service.getCoupEnvoi(); }
  
  @Post('coup-envoi/lancer')
  lancerCoupEnvoi(@Body() data: { types: string[] }) {
    return this.service.coupEnvoi(data.types, new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }));
  }
}

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ParametresService } from './parametres.service';

@Controller('parametres')
export class ParametresController {
  constructor(private readonly parametresService: ParametresService) {}

  @Get('coup-envoi')
  getCoupEnvoi() { return this.parametresService.getCoupEnvoi(); }

  @Post('coup-envoi')
  setCoupEnvoi(@Body() data: { actif: boolean; heure: string }) {
    return this.parametresService.setCoupEnvoi(data.actif, data.heure);
  }

  @Post('coup-envoi/lancer')
  lancerCoupEnvoi() { return this.parametresService.lancerCoupEnvoi(); }

  @Get('mode-type')
  getModeType() { return this.parametresService.getModeType(); }

  @Post('mode-type')
  setModeType(@Body() data: { mode: string; typeImpose: string }) {
    return this.parametresService.setModeType(data.mode, data.typeImpose);
  }

  @Get('stats-pointages')
  getStats(@Query('date') date?: string) { return this.parametresService.getStats(date); }
}

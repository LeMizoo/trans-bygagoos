import { Controller, Get, Post, Body } from '@nestjs/common';
import { ParametresService } from './parametres.service';

@Controller('parametres')
export class ParametresController {
  constructor(private readonly service: ParametresService) {}

  @Get()
  getAll() { return this.service.getAll(); }

  @Post('general')
  saveGeneral(@Body() data: any) { return this.service.saveGeneral(data); }

  @Post('style')
  saveStyle(@Body() data: any) { return this.service.saveStyle(data); }
}

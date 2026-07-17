import { Controller, Get, Put, Body } from '@nestjs/common';
import { ParametresService } from './parametres.service';

@Controller('parametres')
export class ParametresController {
  constructor(private readonly parametresService: ParametresService) {}

  @Get()
  findAll() {
    return this.parametresService.findAll();
  }

  @Put()
  update(@Body() data: any) {
    return this.parametresService.update(data);
  }
}

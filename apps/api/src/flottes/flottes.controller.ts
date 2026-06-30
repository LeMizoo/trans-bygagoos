import { Controller, Post, Body } from '@nestjs/common';
import { FlottesService } from './flottes.service';

@Controller('flottes')
export class FlottesController {
  constructor(private readonly service: FlottesService) {}

  @Post('register')
  async register(@Body() data: {
    nomFlotte: string;
    description?: string;
    telephone?: string;
    adresse?: string;
    nom: string;
    email: string;
    password: string;
  }) {
    return this.service.register(data);
  }
}

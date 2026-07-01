import { Controller, Post, Body } from '@nestjs/common';
import { FlottesService } from './flottes.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('flottes')
export class FlottesController {
  constructor(
    private readonly service: FlottesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  async register(@Body() data: {
    nomFlotte: string;
    description?: string;
    telephone?: string;
    adresse?: string;
    nom: string;
    email: string;
    password: string;
    logo?: string;
  }) {
    return this.service.register(data);
  }

  // Endpoint temporaire pour forcer le seed sur Render
  @Post('force-seed')
  async forceSeed() {
    const existing = await this.prisma.user.findUnique({
      where: { email: 'tovoniaina.rahendrison@gmail.com' },
    });
    if (existing) return { message: '✅ SUPER_ADMIN existe déjà', user: existing.email };

    const admin = await this.prisma.user.create({
      data: {
        email: 'tovoniaina.rahendrison@gmail.com',
        nom: 'Tovoniaina RAHENDRISON',
        password: await bcrypt.hash('ByGagoos@2024!', 10),
        role: 'SUPER_ADMIN',
      },
    });
    return { message: '✅ SUPER_ADMIN créé', user: admin.email };
  }
}

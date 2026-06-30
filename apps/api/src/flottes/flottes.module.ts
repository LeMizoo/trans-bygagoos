import { Module } from '@nestjs/common';
import { FlottesController } from './flottes.controller';
import { FlottesService } from './flottes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FlottesController],
  providers: [FlottesService],
})
export class FlottesModule {}

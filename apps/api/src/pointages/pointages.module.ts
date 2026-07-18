import { Module } from '@nestjs/common';
import { PointagesService } from './pointages.service';
import { PointagesController } from './pointages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PointagesController],
  providers: [PointagesService],
  exports: [PointagesService],
})
export class PointagesModule {}

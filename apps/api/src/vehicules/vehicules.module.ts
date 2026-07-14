import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VehiculesService } from './vehicules.service';
import { VehiculesController } from './vehicules.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VehiculesController],
  providers: [VehiculesService],
  exports: [VehiculesService],
})
export class VehiculesModule {}

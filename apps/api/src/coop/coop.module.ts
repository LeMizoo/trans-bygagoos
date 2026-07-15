import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CoopService } from './coop.service';
import { CoopController } from './coop.controller';
import { FlottesController } from './flottes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CoopController, FlottesController],
  providers: [CoopService],
  exports: [CoopService],
})
export class CoopModule {}

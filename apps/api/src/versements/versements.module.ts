import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VersementsController } from './versements.controller';
import { VersementsService } from './versements.service';

@Module({
  imports: [PrismaModule],
  controllers: [VersementsController],
  providers: [VersementsService],
})
export class VersementsModule {}

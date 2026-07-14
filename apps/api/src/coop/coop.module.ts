import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CoopService } from './coop.service';
import { CoopController } from './coop.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CoopController],
  providers: [CoopService],
  exports: [CoopService],
})
export class CoopModule {}

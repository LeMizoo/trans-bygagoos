import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommandesService } from './commandes.service';
import { CommandesController } from './commandes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CommandesController],
  providers: [CommandesService],
  exports: [CommandesService],
})
export class CommandesModule {}

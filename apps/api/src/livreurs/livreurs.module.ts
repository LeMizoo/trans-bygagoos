import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LivreursService } from './livreurs.service';
import { LivreursController } from './livreurs.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LivreursController],
  providers: [LivreursService],
  exports: [LivreursService],
})
export class LivreursModule {}

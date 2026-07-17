import { Module } from '@nestjs/common';
import { AbonnementsController } from './abonnements.controller';
import { AbonnementsService } from './abonnements.service';

@Module({
  controllers: [AbonnementsController],
  providers: [AbonnementsService],
})
export class AbonnementsModule {}

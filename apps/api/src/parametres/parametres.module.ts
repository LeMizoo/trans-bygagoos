import { Module } from '@nestjs/common';
import { ParametresService } from './parametres.service';
import { ParametresController } from './parametres.controller';

@Module({
  controllers: [ParametresController],
  providers: [ParametresService],
  exports: [ParametresService],
})
export class ParametresModule {}

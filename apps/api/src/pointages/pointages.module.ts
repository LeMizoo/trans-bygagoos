import { Module } from '@nestjs/common';
import { PointagesService } from './pointages.service';
import { PointagesController } from './pointages.controller';

@Module({
  controllers: [PointagesController],
  providers: [PointagesService],
  exports: [PointagesService],
})
export class PointagesModule {}

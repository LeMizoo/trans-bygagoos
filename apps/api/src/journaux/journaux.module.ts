import { Module } from '@nestjs/common';
import { JournauxService } from './journaux.service';
import { JournauxController } from './journaux.controller';

@Module({
  controllers: [JournauxController],
  providers: [JournauxService],
})
export class JournauxModule {}

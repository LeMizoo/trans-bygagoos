import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProprietairesService } from './proprietaires.service';
import { ProprietairesController } from './proprietaires.controller';

@Module({
  imports: [AuthModule],
  controllers: [ProprietairesController],
  providers: [ProprietairesService],
  exports: [ProprietairesService],
})
export class ProprietairesModule {}

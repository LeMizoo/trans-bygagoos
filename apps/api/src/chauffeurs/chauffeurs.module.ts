import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChauffeursService } from './chauffeurs.service';
import { ChauffeursController } from './chauffeurs.controller';

@Module({
  imports: [AuthModule],
  controllers: [ChauffeursController],
  providers: [ChauffeursService],
  exports: [ChauffeursService],
})
export class ChauffeursModule {}

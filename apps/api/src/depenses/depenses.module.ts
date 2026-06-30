import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DepensesService } from './depenses.service';
import { DepensesController } from './depenses.controller';

@Module({
  imports: [AuthModule],
  controllers: [DepensesController],
  providers: [DepensesService],
  exports: [DepensesService],
})
export class DepensesModule {}

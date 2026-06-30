import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MotosService } from './motos.service';
import { MotosController } from './motos.controller';

@Module({
  imports: [AuthModule],
  controllers: [MotosController],
  providers: [MotosService],
  exports: [MotosService],
})
export class MotosModule {}

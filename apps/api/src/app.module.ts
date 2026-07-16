import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoopModule } from './coop/coop.module';
import { CommandesModule } from './commandes/commandes.module';
import { LivreursModule } from './livreurs/livreurs.module';
import { VehiculesModule } from './vehicules/vehicules.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CoopModule,
    CommandesModule,
    LivreursModule,
    VehiculesModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

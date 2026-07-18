import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoopModule } from './coop/coop.module';
import { CommandesModule } from './commandes/commandes.module';
import { LivreursModule } from './livreurs/livreurs.module';
import { ParametresModule } from './parametres/parametres.module';
import { AbonnementsModule } from './abonnements/abonnements.module';
import { VersementsModule } from './versements/versements.module';
import { DepensesModule } from './depenses/depenses.module';
import { RapportsModule } from './rapports/rapports.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';
import { VehiculesModule } from './vehicules/vehicules.module';
import { CoursesModule } from './courses/courses.module';
import { PointagesModule } from './pointages/pointages.module';
import { LogsModule } from './logs/logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AssistanceModule } from './assistance/assistance.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    PrismaModule, AuthModule, CoopModule,
    CommandesModule, LivreursModule, ParametresModule,
    AbonnementsModule, VersementsModule, DepensesModule,
    RapportsModule, UtilisateursModule, VehiculesModule,
    CoursesModule, PointagesModule, LogsModule,
    NotificationsModule, AssistanceModule, SocketModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

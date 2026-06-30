import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChauffeursModule } from './chauffeurs/chauffeurs.module';
import { CoursesModule } from './courses/courses.module';
import { VersementsModule } from './versements/versements.module';
import { PointagesModule } from './pointages/pointages.module';
import { AssistanceModule } from './assistance/assistance.module';
import { DepensesModule } from './depenses/depenses.module';
import { ContratsModule } from './contrats/contrats.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MotosModule } from './motos/motos.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { ParametresModule } from './parametres/parametres.module';
import { AlertesModule } from './alertes/alertes.module';
import { ProprietairesModule } from './proprietaires/proprietaires.module';
import { JournauxModule } from './journaux/journaux.module';
import { UsersModule } from './users/users.module';
import { ProprietaireFilter } from './auth/proprietaire.filter';

@Module({
  imports: [
    PrismaModule, AuthModule, ChauffeursModule, CoursesModule,
    VersementsModule, PointagesModule, AssistanceModule,
    DepensesModule, ContratsModule, DashboardModule, MotosModule,
    NotificationsModule, MessagesModule, ParametresModule, AlertesModule,
    ProprietairesModule, JournauxModule, UsersModule,
  ],
  providers: [ProprietaireFilter],
})
export class AppModule {}

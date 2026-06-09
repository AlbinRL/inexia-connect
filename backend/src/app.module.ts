import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { SallesModule } from './salles/salles.module';
import { ReservationsModule } from './reservations/reservations.module';
import { MaterielModule } from './materiel/materiel.module';

@Module({
  imports: [
    // Modules métier exposés via API REST.
    AuthModule,
    SitesModule,
    SallesModule,
    UsersModule,
    ReservationsModule,
    MaterielModule,
  ],
  controllers: [AppController],
  // PrismaService est partagé par injection dans tous les services.
  providers: [AppService, PrismaService],
})
export class AppModule {}

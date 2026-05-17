import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule], // <-- On l'ajoute dans les imports
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

// Ce fichier sert a declarer le module Salles (controller + service).
import { Module } from '@nestjs/common';
import { SallesService } from './salles.service';
import { SallesController } from './salles.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SallesController],
  providers: [SallesService, PrismaService],
})
export class SallesModule {}

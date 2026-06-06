import { Module } from '@nestjs/common';
import { SallesService } from './salles.service';
import { SallesController } from './salles.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SallesController],
  providers: [SallesService, PrismaService],
})
export class SallesModule {}

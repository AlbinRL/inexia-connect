import { Module } from '@nestjs/common';
import { MaterielService } from './materiel.service';
import { MaterielController } from './materiel.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [MaterielService],
  controllers: [MaterielController],
})
export class MaterielModule {}

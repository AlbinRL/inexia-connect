// Ce fichier sert a centraliser la connexion Prisma a la base PostgreSQL.
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Adaptateur PostgreSQL utilisé par Prisma pour cette application.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // On injecte explicitement l'adapter DB au client Prisma.
    super({ adapter });
  }

  async onModuleInit() {
    // Connexion ouverte au démarrage Nest pour éviter la latence du premier appel.
    await this.$connect();
  }
}

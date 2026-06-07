// LIGNE MAGIQUE : On force l'URL Supabase en mémoire pour tout le projet NestJS
process.env.DATABASE_URL =
  'postgresql://postgres.xyodrakufzmysnihukvd:Inexiaconnect2765@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // On autorise la communication avec le site web
  app.enableCors();

  await app.listen(3000);
}
bootstrap();

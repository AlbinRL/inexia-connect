// Bootstrap local: DATABASE_URL injectée avant l'initialisation de Prisma.
process.env.DATABASE_URL =
  'postgresql://postgres.xyodrakufzmysnihukvd:Inexiaconnect2765@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS nécessaire pour autoriser les appels frontend (web/mobile) vers l'API.
  app.enableCors();

  await app.listen(3000);
}
bootstrap();

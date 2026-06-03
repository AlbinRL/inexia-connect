import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Autoriser l'interface HTML à requêter l'API (TRÈS IMPORTANT POUR LA DÉMO)
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

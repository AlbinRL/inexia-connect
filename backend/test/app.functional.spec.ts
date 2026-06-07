import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('3. TEST FONCTIONNEL (E2E) - API Inexia-Connect', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("/ (GET) - Doit répondre Hello World de l'API", async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.text).toBe('Hello World!');
  });

  it('/users (GET) - Doit retourner la liste des collaborateurs', async () => {
    const response = (await request(app.getHttpServer())
      .get('/users')
      .expect(200)) as unknown as { body: unknown[] };

    expect(Array.isArray(response.body)).toBe(true);
  });
});

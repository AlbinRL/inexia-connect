import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';

// Interface stricte pour la cohérence des données Inexia
interface InexiaUser {
  id: number;
  email: string;
  nom: string;
}

describe('4. TEST DE PERFORMANCE - API Benchmark (Inexia-Connect)', () => {
  let controller: UsersController;

  // Mock strict du service Prisma
  const mockPrismaService = {
    utilisateur: {
      findMany: jest.fn<() => Promise<InexiaUser[]>>().mockResolvedValue([
        { id: 1, email: 'albin.roustan@inexia.fr', nom: 'Albin' },
        { id: 2, email: 'collaborateur@inexia.fr', nom: 'Jean Dupont' },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('Doit charger la liste des utilisateurs en moins de 200ms', async () => {
    const start = performance.now();

    await controller.findAll();

    const end = performance.now();
    const executionTime = end - start;

    console.log(
      `\x1b[36m[PERF BENCHMARK] Temps de réponse de la route /utilisateurs : ${executionTime.toFixed(2)}ms\x1b[0m`,
    );

    expect(executionTime).toBeLessThan(200);
  });
});

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { UsersService } from '../src/users/users.service';

describe('1. TEST UNITAIRE - UsersService', () => {
  let service: UsersService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      utilisateur: {
        findMany: jest.fn<() => Promise<any>>().mockResolvedValue([
          { id: 1, email: 'albin.roustan@inexia.fr', nom: 'Albin' },
          { id: 2, email: 'collaborateur@inexia.fr', nom: 'Jean Dupont' },
        ]),
      },
    };

    service = new UsersService(mockPrisma);
  });

  it('should fetch all users correctly (Vérification de la récupération)', async () => {
    const users = await service.findAll();

    expect(users).toHaveLength(2);
    expect(users[0]).toHaveProperty('email', 'albin.roustan@inexia.fr');
    expect(mockPrisma.utilisateur.findMany).toHaveBeenCalledTimes(1);
  });
});

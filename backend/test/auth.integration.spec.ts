import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';

interface InexiaUser {
  id: number;
  email: string;
  nom: string;
  role: string;
}

interface MockUsersService {
  findAll: jest.Mock<() => Promise<InexiaUser[]>>;
}

interface LoginResponse {
  message: string;
  email: string;
}

describe("2. TEST D'INTÉGRATION - Auth & Users (Inexia-Connect)", () => {
  let authController: AuthController;
  let mockUsersService: MockUsersService;

  beforeEach(async () => {
    mockUsersService = {
      findAll: jest.fn<() => Promise<InexiaUser[]>>().mockResolvedValue([
        {
          id: 1,
          email: 'albin.roustan@inexia.fr',
          nom: 'Albin',
          role: 'admin',
        },
        {
          id: 2,
          email: 'collaborateur@inexia.fr',
          nom: 'Jean Dupont',
          role: 'user',
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should validate user integration during login', async () => {
    const loginPayload = { email: 'albin.roustan@inexia.fr' };

    const response = (await authController.login(
      loginPayload,
    )) as unknown as LoginResponse;

    expect(response).toEqual({
      message: 'Connexion réussie',
      email: 'albin.roustan@inexia.fr',
    });

    expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
  });
});

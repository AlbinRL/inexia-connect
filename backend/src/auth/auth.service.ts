import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(email: string): Promise<any> {
    // On utilise 'await' pour simuler une recherche d'utilisateurs en base
    const users = await this.usersService.findAll();
    if (!email) {
      throw new UnauthorizedException();
    }
    return { message: 'Connexion réussie', email };
  }
}

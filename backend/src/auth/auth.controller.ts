// Ce fichier sert a exposer les endpoints d'authentification (register/login).
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Inscription publique: crée un collaborateur et retourne directement un JWT prêt à l'emploi.
  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      motDePasse: string;
      nom: string;
      prenom: string;
    },
  ) {
    return this.authService.register(body);
  }

  // Connexion: vérifie les identifiants et renvoie token + profil minimal.
  @Post('login')
  async login(@Body() body: { email: string; motDePasse: string }) {
    return this.authService.login(body.email, body.motDePasse);
  }
}

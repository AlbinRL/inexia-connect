import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, motDePasse: string) {
    // 1. On cherche l'utilisateur par son email
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email },
    });

    // 2. On vérifie s'il existe ET si le mot de passe correspond au hash
    if (
      !utilisateur ||
      !(await bcrypt.compare(motDePasse, utilisateur.motDePasse))
    ) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 3. On prépare le contenu du ticket d'accès (Token JWT)
    const payload = {
      sub: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
    };

    // 4. On renvoie le token et les infos utiles (sans le mot de passe !)
    return {
      access_token: this.jwtService.sign(payload),
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
      },
    };
  }
}

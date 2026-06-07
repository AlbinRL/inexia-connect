import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    motDePasse: string;
    nom: string;
    prenom: string;
  }) {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // 2. Hasher le mot de passe
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.motDePasse, saltOrRounds);

    // 3. Créer l'utilisateur avec le rôle par défaut 'COLLABORATEUR'
    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        email: data.email,
        motDePasse: hashedPassword,
        nom: data.nom,
        prenom: data.prenom,
        role: 'COLLABORATEUR',
      },
    });

    // 4. Préparer le payload du JWT
    const payload = {
      sub: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
    };

    // 5. Renvoyer le token et les infos
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

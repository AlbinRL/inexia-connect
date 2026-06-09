// Ce fichier sert a gerer la logique d'authentification (hash, JWT, login/register).
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
    siteId?: number;
  }) {
    // 1) Vérifier l'unicité email avant toute opération coûteuse.
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // 2) Ne jamais stocker de mot de passe en clair: hash bcrypt + salt rounds.
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.motDePasse, saltOrRounds);

    // 3) Rôle par défaut: COLLABORATEUR (évite d'exposer un rôle admin en inscription publique).
    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        email: data.email,
        motDePasse: hashedPassword,
        nom: data.nom,
        prenom: data.prenom,
        role: 'COLLABORATEUR',
        siteId: data.siteId ?? null,
      },
    });

    // 4) Payload JWT minimal: identité + autorisations utiles au contrôle d'accès.
    const payload = {
      sub: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      siteId: utilisateur.siteId ?? null,
    };

    // 5) Retour API: token + profil sans mot de passe.
    return {
      access_token: this.jwtService.sign(payload),
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
        siteId: utilisateur.siteId ?? null,
      },
    };
  }

  async login(email: string, motDePasse: string) {
    // 1) Chargement de l'utilisateur depuis l'email.
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email },
    });

    // 2) Vérification existence + comparaison du mot de passe avec le hash stocké.
    if (
      !utilisateur ||
      !(await bcrypt.compare(motDePasse, utilisateur.motDePasse))
    ) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 3) Le JWT embarque les claims nécessaires aux guards (sub, role, siteId).
    const payload = {
      sub: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      siteId: utilisateur.siteId ?? null,
    };

    // 4) Réponse normalisée consommée par web/mobile.
    return {
      access_token: this.jwtService.sign(payload),
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
        siteId: utilisateur.siteId ?? null,
      },
    };
  }
}

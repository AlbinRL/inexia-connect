import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Projection volontaire: on exclut les champs sensibles (motDePasse).
    return this.prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
      },
    });
  }

  async findOne(id: number) {
    // findUnique sur la PK puis erreur métier explicite si absent.
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id },
      select: { id: true, nom: true, prenom: true, email: true, role: true, siteId: true },
    });

    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable');
    return utilisateur;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(utilisateurId: number, salleId: number, date: string) {
    return this.prisma.reservation.create({
      data: {
        date: new Date(date),
        utilisateur: {
          connect: { id: utilisateurId },
        },
        salle: {
          connect: { id: salleId },
        },
      },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.reservation.findMany({
      // On passe par l'objet relationnel pour éviter les bugs de cache
      where: {
        utilisateur: { id: userId },
      },
      include: {
        salle: {
          include: {
            site: true,
            equipements: true,
          },
        },
      },
      orderBy: { date: 'asc' }, // Trie du plus récent au plus ancien
    });
  }
}

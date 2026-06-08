import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: number) {
    return this.prisma.reservation.findMany({
      where: { utilisateurId: userId },
      orderBy: { date: 'desc' },
      include: {
        salle: {
          include: {
            site: true,
          },
        },
      },
    });
  }

  async findAll(filters?: { siteId?: number; date?: string }) {
    const where: any = {};

    if (filters?.siteId) {
      where.salle = { siteId: filters.siteId };
    }

    if (filters?.date) {
      const day = new Date(filters.date);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      where.date = { gte: day, lt: next };
    }

    return this.prisma.reservation.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        salle: {
          include: {
            site: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.reservation.findMany({
      where: { utilisateurId: userId },
      orderBy: { date: 'asc' },
      include: {
        salle: {
          include: {
            site: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });
  }

  async create(userId: number, dto: CreateReservationDto) {
    // On utilise une transaction interactive (tx) au lieu de this.prisma
    return this.prisma.$transaction(async (tx) => {
      // 1. On crée d'abord la ligne principale : la Réservation
      const reservation = await tx.reservation.create({
        data: {
          date: new Date(dto.date),
          salleId: dto.salleId,
          utilisateurId: userId,
        },
      });

      return reservation;
    });
  }

  async remove(id: number) {
    return this.prisma.reservation.delete({
      where: { id },
    });
  }
}

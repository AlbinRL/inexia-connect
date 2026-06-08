import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private getLocalDayBoundsFromDateKey(dateKey: string) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { start, end };
  }

  async findByUserId(userId: number) {
    return this.prisma.reservation.findMany({
      where: { utilisateurId: userId },
      orderBy: { dateDebut: 'desc' },
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
      const { start, end } = this.getLocalDayBoundsFromDateKey(filters.date);
      where.dateDebut = { lte: end };
      where.dateFin = { gte: start };
    }

    return this.prisma.reservation.findMany({
      where,
      orderBy: { dateDebut: 'desc' },
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
      orderBy: { dateDebut: 'asc' },
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
    const start = new Date(dto.dateDebut);
    const end = new Date(dto.dateFin);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Les dates de réservation sont invalides');
    }

    if (end <= start) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    // On utilise une transaction interactive (tx) au lieu de this.prisma
    return this.prisma.$transaction(async (tx) => {
      const salle = await tx.salle.findUnique({
        where: { id: dto.salleId },
        select: { id: true, capacite: true },
      });

      if (!salle) {
        throw new NotFoundException('Salle introuvable');
      }

      const overlappingReservations = await tx.reservation.findMany({
        where: {
          salleId: dto.salleId,
          dateDebut: { lte: end },
          dateFin: { gte: start },
        },
        select: {
          dateDebut: true,
          dateFin: true,
        },
      });

      const events: Array<{ time: number; delta: number }> = [];
      for (const reservation of overlappingReservations) {
        const clippedStart = reservation.dateDebut > start ? reservation.dateDebut : start;
        const clippedEnd = reservation.dateFin < end ? reservation.dateFin : end;

        events.push({ time: clippedStart.getTime(), delta: 1 });
        events.push({ time: clippedEnd.getTime(), delta: -1 });
      }

      events.sort((left, right) => {
        if (left.time !== right.time) return left.time - right.time;
        return right.delta - left.delta; // start events (+1) before end events (-1) to be stricter on shared boundaries
      });

      let occupancy = 0;
      let peakOccupancy = 0;

      for (const event of events) {
        occupancy += event.delta;
        peakOccupancy = Math.max(peakOccupancy, occupancy);
      }

      if (peakOccupancy + 1 > salle.capacite) {
        throw new ConflictException('La salle est déjà complète sur ce créneau');
      }

      // 1. On crée d'abord la ligne principale : la Réservation
      const reservation = await tx.reservation.create({
        data: {
          dateDebut: start,
          dateFin: end,
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

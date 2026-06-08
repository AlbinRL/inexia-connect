import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private formatReservationSlot(start: Date, end: Date) {
    return `${start.toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Paris',
    })} → ${end.toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Paris',
    })}`;
  }

  private async cleanupExpiredCancelledReservations() {
    await this.prisma.reservation.deleteMany({
      where: {
        status: ReservationStatus.CANCELLED,
        dateFin: {
          lt: new Date(),
        },
      },
    });
  }

  private getCurrentReservationStatus(reservation: {
    status?: ReservationStatus;
    dateDebut: Date;
    dateFin: Date;
  }) {
    if (reservation.status === ReservationStatus.CANCELLED) {
      return 'Annulée';
    }

    const now = new Date();
    if (now < reservation.dateDebut) {
      return 'Confirmée';
    }

    if (now >= reservation.dateDebut && now <= reservation.dateFin) {
      return 'En cours';
    }

    return 'Terminée';
  }

  private withStatus<
    T extends { status?: ReservationStatus; dateDebut: Date; dateFin: Date },
  >(reservation: T) {
    return {
      ...reservation,
      statut: this.getCurrentReservationStatus(reservation),
    };
  }

  private getLocalDayBoundsFromDateKey(dateKey: string) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { start, end };
  }

  private getPeakOccupancy(
    reservations: Array<{ dateDebut: Date; dateFin: Date }>,
    start: Date,
    end: Date,
  ) {
    const events: Array<{ time: number; delta: number }> = [];

    for (const reservation of reservations) {
      const clippedStart = reservation.dateDebut > start ? reservation.dateDebut : start;
      const clippedEnd = reservation.dateFin < end ? reservation.dateFin : end;

      events.push({ time: clippedStart.getTime(), delta: 1 });
      events.push({ time: clippedEnd.getTime(), delta: -1 });
    }

    events.sort((left, right) => {
      if (left.time !== right.time) return left.time - right.time;
      return right.delta - left.delta;
    });

    let occupancy = 0;
    let peakOccupancy = 0;

    for (const event of events) {
      occupancy += event.delta;
      peakOccupancy = Math.max(peakOccupancy, occupancy);
    }

    return peakOccupancy;
  }

  async getAvailabilityForSlot(dateDebut: string, dateFin: string) {
    await this.cleanupExpiredCancelledReservations();

    const start = new Date(dateDebut);
    const end = new Date(dateFin);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Les dates de réservation sont invalides');
    }

    if (end <= start) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    const [salles, overlappingReservations] = await this.prisma.$transaction([
      this.prisma.salle.findMany({
        select: {
          id: true,
          capacite: true,
        },
      }),
      this.prisma.reservation.findMany({
        where: {
          status: ReservationStatus.CONFIRMED,
          dateDebut: { lte: end },
          dateFin: { gte: start },
        },
        select: {
          salleId: true,
          dateDebut: true,
          dateFin: true,
        },
      }),
    ]);

    const reservationsByRoom = new Map<number, Array<{ dateDebut: Date; dateFin: Date }>>();

    for (const reservation of overlappingReservations) {
      const currentReservations = reservationsByRoom.get(reservation.salleId) ?? [];
      currentReservations.push({ dateDebut: reservation.dateDebut, dateFin: reservation.dateFin });
      reservationsByRoom.set(reservation.salleId, currentReservations);
    }

    return salles.map((salle) => {
      const roomReservations = reservationsByRoom.get(salle.id) ?? [];
      const peakOccupancy = this.getPeakOccupancy(roomReservations, start, end);
      const available = Math.max(salle.capacite - peakOccupancy, 0);

      return {
        salleId: salle.id,
        capacity: salle.capacite,
        occupied: peakOccupancy,
        available,
      };
    });
  }

  async findByUserId(userId: number) {
    await this.cleanupExpiredCancelledReservations();

    return this.prisma.reservation.findMany({
      where: { utilisateurId: userId },
      orderBy: { dateDebut: 'desc' },
      include: {
        salle: {
          include: {
            site: true,
            equipements: {
              include: {
                materiel: true,
              },
            },
          },
        },
      },
      })
      .then((reservations) =>
        reservations.map((reservation) => this.withStatus(reservation)),
      );
  }

  async findAll(filters?: { siteId?: number; date?: string }) {
    await this.cleanupExpiredCancelledReservations();

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
    }).then((reservations) => reservations.map((reservation) => this.withStatus(reservation)));
  }

  async findByUser(userId: number) {
    await this.cleanupExpiredCancelledReservations();

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
            equipements: {
              include: {
                materiel: true,
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
    }).then((reservations) => reservations.map((reservation) => this.withStatus(reservation)));
  }

  async create(userId: number, dto: CreateReservationDto) {
    await this.cleanupExpiredCancelledReservations();

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
      const overlappingUserReservations = await tx.reservation.findMany({
        where: {
          utilisateurId: userId,
          status: ReservationStatus.CONFIRMED,
          dateDebut: { lte: end },
          dateFin: { gte: start },
        },
        orderBy: { dateDebut: 'asc' },
        select: {
          dateDebut: true,
          dateFin: true,
        },
      });

      if (overlappingUserReservations.length > 0) {
        const conflictingReservation = overlappingUserReservations[0];
        const overlapStart = conflictingReservation.dateDebut > start ? conflictingReservation.dateDebut : start;
        const overlapEnd = conflictingReservation.dateFin < end ? conflictingReservation.dateFin : end;

        throw new ConflictException(
          `Vous avez déjà une réservation en conflit sur le créneau ${this.formatReservationSlot(overlapStart, overlapEnd)}`,
        );
      }

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
          status: ReservationStatus.CONFIRMED,
          dateDebut: { lte: end },
          dateFin: { gte: start },
        },
        select: {
          dateDebut: true,
          dateFin: true,
        },
      });

      const peakOccupancy = this.getPeakOccupancy(overlappingReservations, start, end);

      if (peakOccupancy + 1 > salle.capacite) {
        throw new ConflictException('La salle est déjà complète sur ce créneau');
      }

      // 1. On crée d'abord la ligne principale : la Réservation
      const reservation = await tx.reservation.create({
        data: {
          dateDebut: start,
          dateFin: end,
          status: ReservationStatus.CONFIRMED,
          salleId: dto.salleId,
          utilisateurId: userId,
        },
      });

      return this.withStatus(reservation);
    });
  }

  async remove(id: number) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (reservation.dateFin <= new Date()) {
      return this.prisma.reservation.delete({
        where: { id },
      });
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
    });
  }

  async findById(id: number) {
    await this.cleanupExpiredCancelledReservations();

    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    return reservation ? this.withStatus(reservation) : null;
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReservationsService = class ReservationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatReservationSlot(start, end) {
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
    async cleanupExpiredCancelledReservations() {
        await this.prisma.reservation.deleteMany({
            where: {
                status: client_1.ReservationStatus.CANCELLED,
                dateFin: {
                    lt: new Date(),
                },
            },
        });
    }
    getCurrentReservationStatus(reservation) {
        if (reservation.status === client_1.ReservationStatus.CANCELLED) {
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
    withStatus(reservation) {
        return {
            ...reservation,
            statut: this.getCurrentReservationStatus(reservation),
        };
    }
    getLocalDayBoundsFromDateKey(dateKey) {
        const [year, month, day] = dateKey.split('-').map(Number);
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        return { start, end };
    }
    getPeakOccupancy(reservations, start, end) {
        const events = [];
        for (const reservation of reservations) {
            const clippedStart = reservation.dateDebut > start ? reservation.dateDebut : start;
            const clippedEnd = reservation.dateFin < end ? reservation.dateFin : end;
            events.push({ time: clippedStart.getTime(), delta: 1 });
            events.push({ time: clippedEnd.getTime(), delta: -1 });
        }
        events.sort((left, right) => {
            if (left.time !== right.time)
                return left.time - right.time;
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
    async getAvailabilityForSlot(dateDebut, dateFin) {
        await this.cleanupExpiredCancelledReservations();
        const start = new Date(dateDebut);
        const end = new Date(dateFin);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new common_1.BadRequestException('Les dates de réservation sont invalides');
        }
        if (end <= start) {
            throw new common_1.BadRequestException('La date de fin doit être après la date de début');
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
                    status: client_1.ReservationStatus.CONFIRMED,
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
        const reservationsByRoom = new Map();
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
    async findByUserId(userId) {
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
            .then((reservations) => reservations.map((reservation) => this.withStatus(reservation)));
    }
    async findAll(filters) {
        await this.cleanupExpiredCancelledReservations();
        const where = {};
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
    async findByUser(userId) {
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
    async create(userId, dto) {
        await this.cleanupExpiredCancelledReservations();
        const start = new Date(dto.dateDebut);
        const end = new Date(dto.dateFin);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new common_1.BadRequestException('Les dates de réservation sont invalides');
        }
        if (end <= start) {
            throw new common_1.BadRequestException('La date de fin doit être après la date de début');
        }
        return this.prisma.$transaction(async (tx) => {
            const overlappingUserReservations = await tx.reservation.findMany({
                where: {
                    utilisateurId: userId,
                    status: client_1.ReservationStatus.CONFIRMED,
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
                throw new common_1.ConflictException(`Vous avez déjà une réservation en conflit sur le créneau ${this.formatReservationSlot(overlapStart, overlapEnd)}`);
            }
            const salle = await tx.salle.findUnique({
                where: { id: dto.salleId },
                select: { id: true, capacite: true },
            });
            if (!salle) {
                throw new common_1.NotFoundException('Salle introuvable');
            }
            const overlappingReservations = await tx.reservation.findMany({
                where: {
                    salleId: dto.salleId,
                    status: client_1.ReservationStatus.CONFIRMED,
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
                throw new common_1.ConflictException('La salle est déjà complète sur ce créneau');
            }
            const reservation = await tx.reservation.create({
                data: {
                    dateDebut: start,
                    dateFin: end,
                    status: client_1.ReservationStatus.CONFIRMED,
                    salleId: dto.salleId,
                    utilisateurId: userId,
                },
            });
            return this.withStatus(reservation);
        });
    }
    async remove(id) {
        const reservation = await this.prisma.reservation.findUnique({ where: { id } });
        if (!reservation) {
            throw new common_1.NotFoundException('Réservation introuvable');
        }
        if (reservation.dateFin <= new Date()) {
            return this.prisma.reservation.delete({
                where: { id },
            });
        }
        return this.prisma.reservation.update({
            where: { id },
            data: { status: client_1.ReservationStatus.CANCELLED },
        });
    }
    async findById(id) {
        await this.cleanupExpiredCancelledReservations();
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: {
                salle: {
                    select: {
                        id: true,
                        siteId: true,
                    },
                },
            },
        });
        return reservation ? this.withStatus(reservation) : null;
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map
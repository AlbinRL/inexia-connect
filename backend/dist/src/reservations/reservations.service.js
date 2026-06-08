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
let ReservationsService = class ReservationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getLocalDayBoundsFromDateKey(dateKey) {
        const [year, month, day] = dateKey.split('-').map(Number);
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        return { start, end };
    }
    async findByUserId(userId) {
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
    async findAll(filters) {
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
        });
    }
    async findByUser(userId) {
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
    async create(userId, dto) {
        const start = new Date(dto.dateDebut);
        const end = new Date(dto.dateFin);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new common_1.BadRequestException('Les dates de réservation sont invalides');
        }
        if (end <= start) {
            throw new common_1.BadRequestException('La date de fin doit être après la date de début');
        }
        return this.prisma.$transaction(async (tx) => {
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
                    dateDebut: { lte: end },
                    dateFin: { gte: start },
                },
                select: {
                    dateDebut: true,
                    dateFin: true,
                },
            });
            const events = [];
            for (const reservation of overlappingReservations) {
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
            if (peakOccupancy + 1 > salle.capacite) {
                throw new common_1.ConflictException('La salle est déjà complète sur ce créneau');
            }
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
    async remove(id) {
        return this.prisma.reservation.delete({
            where: { id },
        });
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map
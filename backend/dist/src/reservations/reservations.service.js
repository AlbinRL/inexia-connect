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
    async findByUserId(userId) {
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
    async findAll() {
        return this.prisma.reservation.findMany({
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
    async findByUser(userId) {
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
    async create(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
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
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
exports.SallesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SallesService = class SallesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.salle.findMany({
            include: {
                equipements: {
                    include: { materiel: true },
                },
            },
        });
    }
    findBySite(siteId) {
        return this.prisma.salle.findMany({
            where: { site: { id: siteId } },
            include: {
                equipements: {
                    include: { materiel: true }
                },
            },
        });
    }
    create(data) {
        return this.prisma.salle.create({
            data: {
                nom: data.nom.trim(),
                capacite: data.capacite,
                siteId: data.siteId,
                equipements: data.equipements?.length
                    ? {
                        create: data.equipements.map((equipement) => ({
                            materielId: equipement.materielId,
                            quantite: equipement.quantite,
                        })),
                    }
                    : undefined,
            },
            include: {
                equipements: {
                    include: { materiel: true },
                },
            },
        });
    }
    update(id, data) {
        return this.prisma.salle.update({
            where: { id },
            data: {
                ...(data.nom !== undefined ? { nom: data.nom.trim() } : {}),
                ...(data.capacite !== undefined ? { capacite: data.capacite } : {}),
                ...(data.siteId !== undefined ? { siteId: data.siteId } : {}),
                ...(data.equipements
                    ? {
                        equipements: {
                            deleteMany: {},
                            create: data.equipements.map((equipement) => ({
                                materielId: equipement.materielId,
                                quantite: equipement.quantite,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                equipements: {
                    include: { materiel: true },
                },
            },
        });
    }
    remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const salle = await tx.salle.findUnique({
                where: { id },
                select: {
                    id: true,
                    reservations: {
                        select: { id: true },
                    },
                },
            });
            if (!salle) {
                throw new common_1.NotFoundException('Salle introuvable');
            }
            if (salle.reservations.length > 0) {
                throw new common_1.ConflictException('Cette salle a encore des réservations et ne peut pas être supprimée.');
            }
            await tx.equipement.deleteMany({
                where: { salleId: id },
            });
            return tx.salle.delete({
                where: { id },
            });
        });
    }
};
exports.SallesService = SallesService;
exports.SallesService = SallesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SallesService);
//# sourceMappingURL=salles.service.js.map
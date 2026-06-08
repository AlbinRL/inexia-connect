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
exports.SitesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SitesService = class SitesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.site.findMany({
            include: {
                salles: {
                    include: {
                        equipements: {
                            include: { materiel: true },
                        },
                    },
                },
            },
        });
    }
    findOne(id) {
        return this.prisma.site.findUnique({
            where: { id },
            include: {
                salles: {
                    include: {
                        equipements: { include: { materiel: true } },
                    },
                },
            },
        });
    }
    async getStats(siteId, days = 7) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        const sallesCount = await this.prisma.salle.count({ where: { siteId } });
        const reservations = await this.prisma.reservation.findMany({
            where: {
                date: { gte: new Date(start.setHours(0, 0, 0, 0)), lt: new Date(end.setHours(23, 59, 59, 999)) },
            },
            include: { salle: true },
        });
        const points = [];
        for (let i = 0; i < days; i++) {
            const day = new Date();
            day.setDate(start.getDate() + i);
            day.setHours(0, 0, 0, 0);
            const next = new Date(day);
            next.setDate(day.getDate() + 1);
            const count = reservations.filter((r) => r.salle.siteId === siteId && r.date >= day && r.date < next).length;
            const denom = Math.max(1, sallesCount);
            const taux = +(count / denom).toFixed(3);
            points.push({ date: day.toISOString().split('T')[0], taux });
        }
        return { points };
    }
};
exports.SitesService = SitesService;
exports.SitesService = SitesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SitesService);
//# sourceMappingURL=sites.service.js.map
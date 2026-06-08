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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const reservations_service_1 = require("./reservations.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ReservationsController = class ReservationsController {
    reservationsService;
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    async findMyReservations(req) {
        return this.reservationsService.findByUser(req.user.sub);
    }
    async findUserReservations(req, userId) {
        if (req.user.sub !== userId && req.user.role !== 'ADMIN' && req.user.role !== 'DIRECTEUR') {
            throw new common_1.ForbiddenException('Accès refusé');
        }
        return this.reservationsService.findByUser(userId);
    }
    async findAll(query) {
        return this.reservationsService.findAll({ siteId: query.siteId ? Number(query.siteId) : undefined, date: query.date });
    }
    async getAvailability(query) {
        if (!query.dateDebut || !query.dateFin) {
            throw new common_1.BadRequestException('Les dates de réservation sont requises');
        }
        return this.reservationsService.getAvailabilityForSlot(query.dateDebut, query.dateFin);
    }
    async remove(req, id) {
        const reservation = await this.reservationsService.findById(id);
        if (!reservation) {
            throw new common_1.NotFoundException('Réservation introuvable');
        }
        if (req.user.sub !== reservation.utilisateurId && req.user.role !== 'ADMIN' && req.user.role !== 'DIRECTEUR') {
            throw new common_1.ForbiddenException('Accès refusé');
        }
        return this.reservationsService.remove(id);
    }
    async findByUser(req, userId) {
        if (req.user.sub !== userId) {
            throw new common_1.ForbiddenException('Accès refusé');
        }
        return this.reservationsService.findByUserId(userId);
    }
    async create(req, dto) {
        const userId = req.user.sub;
        return this.reservationsService.create(userId, dto);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findMyReservations", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findUserReservations", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DIRECTEUR'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('availability'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "create", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request as ExpressRequest } from 'express';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    sub: number;
    role?: string;
  };
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('me')
  async findMyReservations(@Request() req: AuthenticatedRequest) {
    return this.reservationsService.findByUser(req.user.sub);
  }

  @Get('user/:userId')
  async findUserReservations(
    @Request() req: AuthenticatedRequest,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    if (req.user.sub !== userId && req.user.role !== 'ADMIN' && req.user.role !== 'DIRECTEUR') {
      throw new ForbiddenException('Accès refusé');
    }

    return this.reservationsService.findByUser(userId);
  }

  @Roles('ADMIN', 'DIRECTEUR')
  @Get()
  async findAll() {
    return this.reservationsService.findAll();
  }

  @Roles('ADMIN', 'DIRECTEUR')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.remove(id);
  }

  @Get('user/:userId')
  async findByUser(
    @Request() req: AuthenticatedRequest,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    if (req.user.sub !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return this.reservationsService.findByUserId(userId);
  }
  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: { date: string; salleId: number },
  ) {
    // Le JwtAuthGuard décode le token et place le payload dans req.user
    // On récupère "sub" qui correspond à l'ID de l'utilisateur (défini dans auth.service.ts)
    const userId = req.user.sub;

    return this.reservationsService.create(userId, dto);
  }
}

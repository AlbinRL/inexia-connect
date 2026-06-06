import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // Route pour créer une réservation
  @Post()
  create(
    @Body() body: { utilisateurId: number; salleId: number; date: string },
  ) {
    return this.reservationsService.create(
      body.utilisateurId,
      body.salleId,
      body.date,
    );
  }

  // Route pour voir le planning d'un collaborateur
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.reservationsService.findByUser(userId);
  }
}

import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('utilisateurs') // <-- Passé en français pour la cohérence
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Récupère l'annuaire complet
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Récupère un seul profil (utile plus tard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}

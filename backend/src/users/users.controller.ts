import { Controller, Get, Param, ParseIntPipe, Logger } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('utilisateurs')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  // Récupère l'annuaire complet
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Récupère un seul profil (utile plus tard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Récupération du profil de l'utilisateur avec l'ID ${id}`);
    return this.usersService.findOne(id);
  }
}

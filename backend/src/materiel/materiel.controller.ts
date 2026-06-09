// Ce fichier sert a exposer les endpoints de gestion du referentiel materiel.
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MaterielService } from './materiel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materiel')
export class MaterielController {
  constructor(private readonly materielService: MaterielService) {}

  @Roles('ADMIN', 'DIRECTEUR')
  @Post()
  create(
    @Body()
    body: {
      nom: string;
    },
  ) {
    // Référentiel global: création d'un type de matériel (pas d'affectation site ici).
    return this.materielService.create(body);
  }

  @Get()
  async findAll() {
    // Utilisé par les formulaires salle pour proposer la liste des matériels disponibles.
    return this.materielService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materielService.findOne(id);
  }

  @Roles('ADMIN', 'DIRECTEUR')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      nom?: string;
    },
  ) {
    return this.materielService.update(id, body);
  }

  @Roles('ADMIN', 'DIRECTEUR')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materielService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MaterielService } from './materiel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

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
      quantiteTotale: number;
      siteId: number;
    },
  ) {
    return this.materielService.create(body);
  }

  // Tous les utilisateurs authentifiés peuvent consulter (y compris COLLABORATEUR)
  @Get()
  findAll(@Query('siteId') siteId?: string) {
    return this.materielService.findAll(siteId ? parseInt(siteId, 10) : undefined);
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
      quantiteTotale?: number;
      siteId?: number;
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

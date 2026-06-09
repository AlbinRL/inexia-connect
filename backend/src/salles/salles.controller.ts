// Ce fichier sert a exposer les endpoints de gestion des salles.
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SallesService } from './salles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('salles')
export class SallesController {
  constructor(private readonly sallesService: SallesService) {}

  @Get()
  findAll(
    @Req() req: { user: { role: string; siteId: number | null } },
    @Query() query: { siteId?: string },
  ) {
    // DIRECTEUR: portée forcée sur son site, sans accès global.
    if (req.user.role === 'DIRECTEUR') {
      return req.user.siteId
        ? this.sallesService.findBySite(req.user.siteId)
        : [];
    }

    // ADMIN: possibilité de filtrer par siteId, sinon liste complète.
    if (query.siteId)
      return this.sallesService.findBySite(Number(query.siteId));
    return this.sallesService.findAll();
  }

  @Post()
  create(
    @Req() req: { user: { role: string; siteId: number | null } },
    @Body()
    body: {
      nom: string;
      capacite: number;
      siteId: number;
      equipements?: { materielId: number; quantite: number }[];
    },
  ) {
    // Un directeur ne peut créer que sur son site de rattachement.
    if (req.user.role === 'DIRECTEUR' && req.user.siteId !== body.siteId) {
      throw new ForbiddenException('Accès limité au site rattaché');
    }

    return this.sallesService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { role: string; siteId: number | null } },
    @Body()
    body: {
      nom?: string;
      capacite?: number;
      siteId?: number;
      equipements?: { materielId: number; quantite: number }[];
    },
  ) {
    // Contrôle de portée avant update pour éviter la modification d'un autre site.
    const salle = await this.sallesService.findOne(id);
    if (!salle) {
      return salle;
    }

    if (req.user.role === 'DIRECTEUR' && salle.siteId !== req.user.siteId) {
      throw new ForbiddenException('Accès limité au site rattaché');
    }

    if (
      req.user.role === 'DIRECTEUR' &&
      body.siteId !== undefined &&
      body.siteId !== req.user.siteId
    ) {
      throw new ForbiddenException('Accès limité au site rattaché');
    }

    return this.sallesService.update(id, body);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { role: string; siteId: number | null } },
  ) {
    // Même logique de portée que pour update.
    const salle = await this.sallesService.findOne(id);
    if (!salle) {
      return salle;
    }

    if (req.user.role === 'DIRECTEUR' && salle.siteId !== req.user.siteId) {
      throw new ForbiddenException('Accès limité au site rattaché');
    }

    return this.sallesService.remove(id);
  }

  @Get('site/:siteId')
  findBySite(
    @Param('siteId', ParseIntPipe) siteId: number,
    @Req() req: { user: { role: string; siteId: number | null } },
  ) {
    // Endpoint pratique pour front/mobile quand un filtre par site est requis.
    if (req.user.role === 'DIRECTEUR' && req.user.siteId !== siteId) {
      throw new ForbiddenException('Accès limité au site rattaché');
    }

    return this.sallesService.findBySite(siteId);
  }
}

import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SitesService } from './sites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  findAll(@Req() req: { user: { role: string; siteId: number | null } }) {
    if (req.user.role === 'DIRECTEUR') {
      return req.user.siteId ? this.sitesService.findOne(req.user.siteId) : null;
    }

    return this.sitesService.findAll();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() body: { nom: string; ville: string }) {
    return this.sitesService.create(body);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.remove(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { role: string; siteId: number | null } }) {
    if (req.user.role === 'DIRECTEUR' && req.user.siteId !== id) {
      throw new ForbiddenException('Accès limité au site rattaché');
    }

    return this.sitesService.findOne(id);
  }

  @Get(':id/stats')
  async stats(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { role: string; siteId: number | null } },
    @Query('days') days?: string,
    @Query('startOffset') startOffset?: string,
  ) {
    if (req.user.role === 'DIRECTEUR' && req.user.siteId !== id) {
      throw new ForbiddenException('Accès limité au site rattaché');
    }

    return this.sitesService.getStats(
      id,
      days ? Number(days) : undefined,
      startOffset ? Number(startOffset) : undefined,
    );
  }
}

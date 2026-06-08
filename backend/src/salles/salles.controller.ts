import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { SallesService } from './salles.service';

@Controller('salles')
export class SallesController {
  constructor(private readonly sallesService: SallesService) {}

  @Get()
  findAll(@Query() query: { siteId?: string }) {
    if (query.siteId) return this.sallesService.findBySite(Number(query.siteId));
    return this.sallesService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      nom: string;
      capacite: number;
      siteId: number;
      equipements?: { materielId: number; quantite: number }[];
    },
  ) {
    return this.sallesService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      nom?: string;
      capacite?: number;
      siteId?: number;
      equipements?: { materielId: number; quantite: number }[];
    },
  ) {
    return this.sallesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sallesService.remove(id);
  }

  // Route pour filtrer les salles par agence (ex: /salles/site/1)
  @Get('site/:siteId')
  findBySite(@Param('siteId', ParseIntPipe) siteId: number) {
    return this.sallesService.findBySite(siteId);
  }
}

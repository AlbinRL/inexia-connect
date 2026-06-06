import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SallesService } from './salles.service';

@Controller('salles')
export class SallesController {
  constructor(private readonly sallesService: SallesService) {}

  @Get()
  findAll() {
    return this.sallesService.findAll();
  }

  // Route pour filtrer les salles par agence (ex: /salles/site/1)
  @Get('site/:siteId')
  findBySite(@Param('siteId', ParseIntPipe) siteId: number) {
    return this.sallesService.findBySite(siteId);
  }
}

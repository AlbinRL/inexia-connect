import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.findOne(id);
  }

  @Get(':id/stats')
  async stats(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.getStats(id);
  }
}

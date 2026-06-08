import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  @Post()
  create(@Body() body: { nom: string; ville: string }) {
    return this.sitesService.create(body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.remove(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.findOne(id);
  }

  @Get(':id/stats')
  async stats(
    @Param('id', ParseIntPipe) id: number,
    @Query('days') days?: string,
    @Query('startOffset') startOffset?: string,
  ) {
    return this.sitesService.getStats(
      id,
      days ? Number(days) : undefined,
      startOffset ? Number(startOffset) : undefined,
    );
  }
}

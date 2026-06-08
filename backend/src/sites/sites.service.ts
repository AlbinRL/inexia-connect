import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.site.findMany({
      include: {
        salles: {
          include: {
            equipements: {
              include: { materiel: true },
            },
          },
        },
      },
    });
  }
}

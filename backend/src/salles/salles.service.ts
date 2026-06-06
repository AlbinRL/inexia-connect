import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SallesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    // Le "include" permet de renvoyer le matériel (écrans, etc.) avec la salle
    return this.prisma.salle.findMany({
      include: { equipements: true },
    });
  }

  findBySite(siteId: number) {
    return this.prisma.salle.findMany({
      where: { site: { id: siteId } },
      include: { equipements: true },
    });
  }
}

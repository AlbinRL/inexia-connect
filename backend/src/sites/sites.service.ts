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

  findOne(id: number) {
    return this.prisma.site.findUnique({
      where: { id },
      include: {
        salles: {
          include: {
            equipements: { include: { materiel: true } },
          },
        },
      },
    });
  }

  async getStats(siteId: number, days = 7) {
    // Calculate reservation counts per day for the last `days` days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    // Fetch salles count for normalization
    const sallesCount = await this.prisma.salle.count({ where: { siteId } });

    // Fetch reservations for the site in the date range
    const reservations = await this.prisma.reservation.findMany({
      where: {
        date: { gte: new Date(start.setHours(0, 0, 0, 0)), lt: new Date(end.setHours(23, 59, 59, 999)) },
      },
      include: { salle: true },
    });

    // Map dates
    const points: { date: string; taux: number }[] = [];
    for (let i = 0; i < days; i++) {
      const day = new Date();
      day.setDate(start.getDate() + i);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);

      const count = reservations.filter((r) => r.salle.siteId === siteId && r.date >= day && r.date < next).length;
      const denom = Math.max(1, sallesCount);
      const taux = +(count / denom).toFixed(3); // simple ratio
      points.push({ date: day.toISOString().split('T')[0], taux });
    }

    return { points };
  }
}

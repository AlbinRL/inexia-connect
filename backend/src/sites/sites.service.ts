import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

  private getLocalDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getLocalDayBounds(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

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

  create(data: { nom: string; ville: string }) {
    return this.prisma.site.create({
      data: {
        nom: data.nom.trim(),
        ville: data.ville.trim(),
      },
    });
  }

  remove(id: number) {
    return this.prisma.site.delete({
      where: { id },
    });
  }

  async getStats(siteId: number, days = 37, startOffsetDays = -6) {
    // Build a local date range centered on today by default: -6 days to +30 days
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + startOffsetDays);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));
    end.setHours(23, 59, 59, 999);

    // Fetch salles count for normalization
    const sallesCount = await this.prisma.salle.count({ where: { siteId } });

    // Fetch reservations for the site in the date range
    const reservations = await this.prisma.reservation.findMany({
      where: {
        dateDebut: { lte: end },
        dateFin: { gte: start },
      },
      include: { salle: true },
    });

    // Map dates
    const points: { date: string; taux: number }[] = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);

      const count = reservations.filter((r) => r.salle.siteId === siteId && r.dateDebut <= next && r.dateFin >= day).length;
      const denom = Math.max(1, sallesCount);
      const taux = +(count / denom).toFixed(3); // simple ratio
      points.push({ date: this.getLocalDateKey(day), taux });
    }

    return { points };
  }
}

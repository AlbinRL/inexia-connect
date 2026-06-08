import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SallesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    // Le "include" permet de renvoyer le matériel (écrans, etc.) avec la salle
    return this.prisma.salle.findMany({
      include: {
        equipements: {
          include: { materiel: true },
        },
      },
    });
  }

  findBySite(siteId: number) {
    return this.prisma.salle.findMany({
      where: { site: { id: siteId } },
      include: {
        equipements: {
          include: { materiel: true }
        },
      },
    });
  }

  create(data: {
    nom: string;
    capacite: number;
    siteId: number;
    equipements?: { materielId: number; quantite: number }[];
  }) {
    return this.prisma.salle.create({
      data: {
        nom: data.nom.trim(),
        capacite: data.capacite,
        siteId: data.siteId,
        equipements: data.equipements?.length
          ? {
              create: data.equipements.map((equipement) => ({
                materielId: equipement.materielId,
                quantite: equipement.quantite,
              })),
            }
          : undefined,
      },
      include: {
        equipements: {
          include: { materiel: true },
        },
      },
    });
  }

  update(
    id: number,
    data: {
      nom?: string;
      capacite?: number;
      siteId?: number;
      equipements?: { materielId: number; quantite: number }[];
    },
  ) {
    return this.prisma.salle.update({
      where: { id },
      data: {
        ...(data.nom !== undefined ? { nom: data.nom.trim() } : {}),
        ...(data.capacite !== undefined ? { capacite: data.capacite } : {}),
        ...(data.siteId !== undefined ? { siteId: data.siteId } : {}),
        ...(data.equipements
          ? {
              equipements: {
                deleteMany: {},
                create: data.equipements.map((equipement) => ({
                  materielId: equipement.materielId,
                  quantite: equipement.quantite,
                })),
              },
            }
          : {}),
      },
      include: {
        equipements: {
          include: { materiel: true },
        },
      },
    });
  }

  remove(id: number) {
    return this.prisma.salle.delete({
      where: { id },
    });
  }
}

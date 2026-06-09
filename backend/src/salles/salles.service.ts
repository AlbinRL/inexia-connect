import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    // Filtrage par relation site pour limiter les vues directeur/site.
    return this.prisma.salle.findMany({
      where: { site: { id: siteId } },
      include: {
        equipements: {
          include: { materiel: true },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.salle.findUnique({
      where: { id },
      include: {
        equipements: {
          include: { materiel: true },
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
    // Création salle + éventuels équipements (table de jointure Equipement).
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
    // Stratégie simple: si des équipements sont fournis, on remplace intégralement la liste.
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
    // Suppression protégée: interdit si des réservations existent pour préserver l'historique métier.
    return this.prisma.$transaction(async (tx) => {
      const salle = await tx.salle.findUnique({
        where: { id },
        select: {
          id: true,
          reservations: {
            select: { id: true },
          },
        },
      });

      if (!salle) {
        throw new NotFoundException('Salle introuvable');
      }

      if (salle.reservations.length > 0) {
        throw new ConflictException(
          'Cette salle a encore des réservations et ne peut pas être supprimée.',
        );
      }

      // Nettoyage de la table de jointure avant suppression de la salle.
      await tx.equipement.deleteMany({
        where: { salleId: id },
      });

      return tx.salle.delete({
        where: { id },
      });
    });
  }
}

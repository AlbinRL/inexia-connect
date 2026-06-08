import { PrismaService } from '../prisma/prisma.service';
export declare class SitesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        salles: ({
            equipements: ({
                materiel: {
                    id: number;
                    nom: string;
                };
            } & {
                id: number;
                salleId: number;
                materielId: number;
                quantite: number;
            })[];
        } & {
            id: number;
            nom: string;
            capacite: number;
            siteId: number;
        })[];
    } & {
        id: number;
        nom: string;
        ville: string;
    })[]>;
}

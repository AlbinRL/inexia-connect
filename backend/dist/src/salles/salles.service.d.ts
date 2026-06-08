import { PrismaService } from '../prisma/prisma.service';
export declare class SallesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        equipements: ({
            materiel: {
                nom: string;
                id: number;
            };
        } & {
            id: number;
            quantite: number;
            materielId: number;
            salleId: number;
        })[];
    } & {
        nom: string;
        id: number;
        capacite: number;
        siteId: number;
    })[]>;
    findBySite(siteId: number): import("@prisma/client").Prisma.PrismaPromise<({
        equipements: ({
            materiel: {
                nom: string;
                id: number;
            };
        } & {
            id: number;
            quantite: number;
            materielId: number;
            salleId: number;
        })[];
    } & {
        nom: string;
        id: number;
        capacite: number;
        siteId: number;
    })[]>;
}

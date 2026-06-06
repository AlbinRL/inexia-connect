import { PrismaService } from '../prisma/prisma.service';
export declare class SallesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        equipements: {
            id: number;
            nom: string;
            actif: boolean;
            salleId: number;
        }[];
    } & {
        id: number;
        nom: string;
        capacite: number;
        siteId: number;
    })[]>;
    findBySite(siteId: number): import("@prisma/client").Prisma.PrismaPromise<({
        equipements: {
            id: number;
            nom: string;
            actif: boolean;
            salleId: number;
        }[];
    } & {
        id: number;
        nom: string;
        capacite: number;
        siteId: number;
    })[]>;
}

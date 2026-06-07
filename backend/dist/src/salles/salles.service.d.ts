import { PrismaService } from '../prisma/prisma.service';
export declare class SallesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        equipements: {
            nom: string;
            id: number;
            salleId: number;
            actif: boolean;
        }[];
    } & {
        nom: string;
        id: number;
        capacite: number;
        siteId: number;
    })[]>;
    findBySite(siteId: number): import("@prisma/client").Prisma.PrismaPromise<({
        equipements: {
            nom: string;
            id: number;
            salleId: number;
            actif: boolean;
        }[];
    } & {
        nom: string;
        id: number;
        capacite: number;
        siteId: number;
    })[]>;
}

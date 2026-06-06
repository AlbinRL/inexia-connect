import { PrismaService } from '../prisma/prisma.service';
export declare class SallesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        equipements: {
            id: number;
            libelle: string;
        }[];
    } & {
        id: number;
        nom_salle: string;
        etage: number;
        type: string;
        capacite: number;
        id_site: number;
    })[]>;
    findBySite(siteId: number): import("@prisma/client").Prisma.PrismaPromise<({
        equipements: {
            id: number;
            libelle: string;
        }[];
    } & {
        id: number;
        nom_salle: string;
        etage: number;
        type: string;
        capacite: number;
        id_site: number;
    })[]>;
}

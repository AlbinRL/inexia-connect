import { SallesService } from './salles.service';
export declare class SallesController {
    private readonly sallesService;
    constructor(sallesService: SallesService);
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
        siteId: number;
        capacite: number;
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
        siteId: number;
        capacite: number;
    })[]>;
}

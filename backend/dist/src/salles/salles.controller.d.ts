import { SallesService } from './salles.service';
export declare class SallesController {
    private readonly sallesService;
    constructor(sallesService: SallesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    findBySite(siteId: number): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
}

import { SallesService } from './salles.service';
export declare class SallesController {
    private readonly sallesService;
    constructor(sallesService: SallesService);
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

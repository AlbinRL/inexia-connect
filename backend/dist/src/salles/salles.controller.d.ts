import { SallesService } from './salles.service';
export declare class SallesController {
    private readonly sallesService;
    constructor(sallesService: SallesService);
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

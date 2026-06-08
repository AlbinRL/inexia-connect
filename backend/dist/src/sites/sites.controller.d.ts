import { SitesService } from './sites.service';
export declare class SitesController {
    private readonly sitesService;
    constructor(sitesService: SitesService);
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

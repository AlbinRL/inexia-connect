import { SitesService } from './sites.service';
export declare class SitesController {
    private readonly sitesService;
    constructor(sitesService: SitesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        salles: ({
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
        })[];
    } & {
        nom: string;
        ville: string;
        id: number;
    })[]>;
    create(body: {
        nom: string;
        ville: string;
    }): import("@prisma/client").Prisma.Prisma__SiteClient<{
        nom: string;
        ville: string;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__SiteClient<{
        nom: string;
        ville: string;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__SiteClient<({
        salles: ({
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
        })[];
    } & {
        nom: string;
        ville: string;
        id: number;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    stats(id: number, days?: string, startOffset?: string): Promise<{
        points: {
            date: string;
            taux: number;
        }[];
    }>;
}

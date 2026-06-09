import { SitesService } from './sites.service';
export declare class SitesController {
    private readonly sitesService;
    constructor(sitesService: SitesService);
    findAll(req: {
        user: {
            role: string;
            siteId: number | null;
        };
    }): import("@prisma/client").Prisma.Prisma__SiteClient<({
        salles: ({
            equipements: ({
                materiel: {
                    id: number;
                    nom: string;
                };
            } & {
                id: number;
                salleId: number;
                quantite: number;
                materielId: number;
            })[];
        } & {
            id: number;
            nom: string;
            siteId: number;
            capacite: number;
        })[];
    } & {
        id: number;
        nom: string;
        ville: string;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions> | import("@prisma/client").Prisma.PrismaPromise<({
        salles: ({
            equipements: ({
                materiel: {
                    id: number;
                    nom: string;
                };
            } & {
                id: number;
                salleId: number;
                quantite: number;
                materielId: number;
            })[];
        } & {
            id: number;
            nom: string;
            siteId: number;
            capacite: number;
        })[];
    } & {
        id: number;
        nom: string;
        ville: string;
    })[]> | null;
    create(body: {
        nom: string;
        ville: string;
    }): import("@prisma/client").Prisma.Prisma__SiteClient<{
        id: number;
        nom: string;
        ville: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__SiteClient<{
        id: number;
        nom: string;
        ville: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(id: number, req: {
        user: {
            role: string;
            siteId: number | null;
        };
    }): import("@prisma/client").Prisma.Prisma__SiteClient<({
        salles: ({
            equipements: ({
                materiel: {
                    id: number;
                    nom: string;
                };
            } & {
                id: number;
                salleId: number;
                quantite: number;
                materielId: number;
            })[];
        } & {
            id: number;
            nom: string;
            siteId: number;
            capacite: number;
        })[];
    } & {
        id: number;
        nom: string;
        ville: string;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    stats(id: number, req: {
        user: {
            role: string;
            siteId: number | null;
        };
    }, days?: string, startOffset?: string): Promise<{
        points: {
            date: string;
            reservations: number;
        }[];
    }>;
}

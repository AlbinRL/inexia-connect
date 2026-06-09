import { SallesService } from './salles.service';
export declare class SallesController {
    private readonly sallesService;
    constructor(sallesService: SallesService);
    findAll(req: {
        user: {
            role: string;
            siteId: number | null;
        };
    }, query: {
        siteId?: string;
    }): never[] | import("@prisma/client").Prisma.PrismaPromise<({
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
    create(req: {
        user: {
            role: string;
            siteId: number | null;
        };
    }, body: {
        nom: string;
        capacite: number;
        siteId: number;
        equipements?: {
            materielId: number;
            quantite: number;
        }[];
    }): import("@prisma/client").Prisma.Prisma__SalleClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, req: {
        user: {
            role: string;
            siteId: number | null;
        };
    }, body: {
        nom?: string;
        capacite?: number;
        siteId?: number;
        equipements?: {
            materielId: number;
            quantite: number;
        }[];
    }): Promise<({
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
    }) | null>;
    remove(id: number, req: {
        user: {
            role: string;
            siteId: number | null;
        };
    }): Promise<{
        nom: string;
        id: number;
        capacite: number;
        siteId: number;
    } | null>;
    findBySite(siteId: number, req: {
        user: {
            role: string;
            siteId: number | null;
        };
    }): import("@prisma/client").Prisma.PrismaPromise<({
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

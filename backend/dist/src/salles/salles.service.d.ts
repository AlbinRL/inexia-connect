import { PrismaService } from '../prisma/prisma.service';
export declare class SallesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: number): import("@prisma/client").Prisma.Prisma__SalleClient<({
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
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(data: {
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: {
        nom?: string;
        capacite?: number;
        siteId?: number;
        equipements?: {
            materielId: number;
            quantite: number;
        }[];
    }): import("@prisma/client").Prisma.Prisma__SalleClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): Promise<{
        id: number;
        nom: string;
        capacite: number;
        siteId: number;
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
export declare class SitesService {
    private prisma;
    constructor(prisma: PrismaService);
    private getLocalDateKey;
    private getLocalDayBounds;
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
    })[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__SiteClient<({
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
    create(data: {
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
    getStats(siteId: number, days?: number, startOffsetDays?: number): Promise<{
        points: {
            date: string;
            reservations: number;
        }[];
    }>;
}

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
    create(data: {
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
    getStats(siteId: number, days?: number, startOffsetDays?: number): Promise<{
        points: {
            date: string;
            taux: number;
        }[];
    }>;
}

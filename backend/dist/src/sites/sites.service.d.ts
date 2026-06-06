import { PrismaService } from '../prisma/prisma.service';
export declare class SitesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        nom_site: string;
        ville: string;
        adresse: string;
    }[]>;
}

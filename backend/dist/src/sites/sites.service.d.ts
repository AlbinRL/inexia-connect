import { PrismaService } from '../prisma/prisma.service';
export declare class SitesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        nom: string;
        id: number;
        ville: string;
    }[]>;
}

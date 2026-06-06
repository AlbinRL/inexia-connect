import { SitesService } from './sites.service';
export declare class SitesController {
    private readonly sitesService;
    constructor(sitesService: SitesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        nom: string;
        ville: string;
    }[]>;
}

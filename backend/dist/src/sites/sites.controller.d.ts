import { SitesService } from './sites.service';
export declare class SitesController {
    private readonly sitesService;
    constructor(sitesService: SitesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        nom: string;
        id: number;
        ville: string;
    }[]>;
}
